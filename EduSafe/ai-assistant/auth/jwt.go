package auth

import (
    "fmt"
    "log"
    "os"
    "strings"

    "github.com/golang-jwt/jwt/v5"
    "github.com/gin-gonic/gin"
)

type Claims struct {
    ID    string `json:"id"`
    Email string `json:"email,omitempty"`
    Role  string `json:"role,omitempty"`
    jwt.RegisteredClaims
}

func ExtractUserFromToken(c *gin.Context) (*Claims, error) {
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        return nil, fmt.Errorf("no authorization header")
    }

    parts := strings.Split(authHeader, " ")
    if len(parts) != 2 || parts[0] != "Bearer" {
        return nil, fmt.Errorf("invalid authorization header format")
    }

    tokenString := parts[1]
    jwtSecret := os.Getenv("JWT_SECRET")

    // Log for debugging (remove after fix)
    log.Printf("Token received (first 20 chars): %s...", tokenString[:20])
    log.Printf("JWT_SECRET used: %s", jwtSecret)

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(jwtSecret), nil
    })

    if err != nil {
        log.Printf("JWT parse error: %v", err)
        return nil, fmt.Errorf("token invalid: %w", err)
    }

    if !token.Valid {
        return nil, fmt.Errorf("token is not valid")
    }

    log.Printf("Successfully extracted user ID: %s", claims.ID)
    return claims, nil
}

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        claims, err := ExtractUserFromToken(c)
        if err != nil {
            c.JSON(401, gin.H{"error": "Unauthorized", "message": err.Error()})
            c.Abort()
            return
        }
        c.Set("user", claims)
        c.Next()
    }
}