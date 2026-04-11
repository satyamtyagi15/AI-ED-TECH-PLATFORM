package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
    Role      string    `json:"role" bson:"role"`
    Content   string    `json:"content" bson:"content"`
    Timestamp time.Time `json:"timestamp" bson:"timestamp"`
}

type Conversation struct {
    ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    UserID          string             `json:"userId" bson:"userId"`
    Messages        []Message          `json:"messages" bson:"messages"`
    CreatedAt       time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time          `json:"updatedAt" bson:"updatedAt"`
}