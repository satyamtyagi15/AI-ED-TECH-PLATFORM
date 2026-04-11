package handlers

import (
    "context"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"

    "edusafe-ai/ai"
    "edusafe-ai/models"
)

type ChatHandler struct {
    aiClient *ai.AIClient
    db       *mongo.Database
}

func NewChatHandler(db *mongo.Database) *ChatHandler {
    return &ChatHandler{
        aiClient: ai.NewAIClient(),
        db:       db,
    }
}

type ChatRequest struct {
    Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
    Reply          string `json:"reply"`
    ConversationID string `json:"conversationId,omitempty"`
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
    var req ChatRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Message is required"})
        return
    }

    // Use a fixed user ID for all conversations (or generate from IP)
    userID := "anonymous-user"

    conversationID := c.Query("conversationId")
    var conversation models.Conversation
    collection := h.db.Collection("conversations")

    if conversationID == "" {
        conversation = models.Conversation{
            UserID:    userID,
            Messages:  []models.Message{},
            CreatedAt: time.Now(),
            UpdatedAt: time.Now(),
        }
        result, err := collection.InsertOne(context.Background(), conversation)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation"})
            return
        }
        conversation.ID = result.InsertedID.(primitive.ObjectID)
    } else {
        objID, _ := primitive.ObjectIDFromHex(conversationID)
        err := collection.FindOne(context.Background(), bson.M{"_id": objID, "userId": userID}).Decode(&conversation)
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
            return
        }
    }

    var history []ai.Message
    for _, msg := range conversation.Messages {
        history = append(history, ai.Message{
            Role:    msg.Role,
            Content: msg.Content,
        })
    }

    reply, err := h.aiClient.SendMessage(req.Message, history)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service error", "details": err.Error()})
        return
    }

    conversation.Messages = append(conversation.Messages, models.Message{
        Role:      "user",
        Content:   req.Message,
        Timestamp: time.Now(),
    })

    conversation.Messages = append(conversation.Messages, models.Message{
        Role:      "assistant",
        Content:   reply,
        Timestamp: time.Now(),
    })
    conversation.UpdatedAt = time.Now()

    _, err = collection.UpdateOne(
        context.Background(),
        bson.M{"_id": conversation.ID},
        bson.M{"$set": conversation},
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save conversation"})
        return
    }

    c.JSON(http.StatusOK, ChatResponse{
        Reply:          reply,
        ConversationID: conversation.ID.Hex(),
    })
}

func (h *ChatHandler) GetConversations(c *gin.Context) {
    userID := "anonymous-user"
    collection := h.db.Collection("conversations")
    cursor, err := collection.Find(context.Background(), bson.M{"userId": userID})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
        return
    }
    defer cursor.Close(context.Background())

    var conversations []models.Conversation
    if err = cursor.All(context.Background(), &conversations); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode conversations"})
        return
    }

    c.JSON(http.StatusOK, conversations)
}