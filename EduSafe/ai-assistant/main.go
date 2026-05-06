package main

import (
    "context"
    "log"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

    "edusafe-ai/handlers"
    "edusafe-ai/middleware"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("⚠️ No .env file found, using system env")
    }

    // MongoDB connection
    mongoURI := os.Getenv("MONGODB_URI")
    if mongoURI == "" {
        mongoURI = "mongodb://localhost:27017"
    }
    log.Println("📡 Connecting to MongoDB at:", mongoURI)

    clientOptions := options.Client().ApplyURI(mongoURI)
    client, err := mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Fatal("❌ Failed to connect to MongoDB:", err)
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := client.Ping(ctx, nil); err != nil {
        log.Fatal("❌ MongoDB ping failed. Is MongoDB running?", err)
    }
    log.Println("✅ Connected to MongoDB successfully!")

    dbName := os.Getenv("MONGODB_DATABASE")
    if dbName == "" {
        dbName = "edusafe"
    }
    db := client.Database(dbName)

    chatHandler := handlers.NewChatHandler(db)

    router := gin.Default()
    router.Use(middleware.CORS())

    router.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status":  "ok",
            "service": "EduSafe AI Assistant",
            "mongodb": "connected",
        })
    })

    api := router.Group("/api/ai")
    {
        // Existing endpoints
        api.POST("/chat", chatHandler.SendMessage)
        api.GET("/conversations", chatHandler.GetConversations)

        // New endpoints for quiz generator & daily challenge
        api.POST("/generate-quiz", chatHandler.GenerateQuiz)
        api.POST("/generate-daily-challenge", chatHandler.GenerateDailyChallenge)
    }

    port := os.Getenv("AI_SERVICE_PORT")
    if port == "" {
        port = "8080"
    }
    log.Printf("🚀 AI Assistant service starting on http://localhost:%s", port)
    if err := router.Run(":" + port); err != nil {
        log.Fatal("❌ Failed to start server:", err)
    }
}