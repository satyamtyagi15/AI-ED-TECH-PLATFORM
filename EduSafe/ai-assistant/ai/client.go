package ai

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
)

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type OpenRouterRequest struct {
    Model     string    `json:"model"`
    Messages  []Message `json:"messages"`
    MaxTokens int       `json:"max_tokens,omitempty"`
}

type OpenRouterResponse struct {
    Choices []struct {
        Message struct {
            Content string `json:"content"`
        } `json:"message"`
    } `json:"choices"`
    Error *struct {
        Message string `json:"message"`
    } `json:"error"`
}

type AIClient struct {
    apiKey string
    model  string
}

func NewAIClient() *AIClient {
    apiKey := os.Getenv("OPENROUTER_API_KEY")
    model := os.Getenv("OPENROUTER_MODEL")
    if model == "" {
        // Use a guaranteed working model (change to any from https://openrouter.ai/models)
        model = "openai/gpt-3.5-turbo"
    }
    return &AIClient{
        apiKey: apiKey,
        model:  model,
    }
}

func (c *AIClient) SendMessage(userMessage string, history []Message) (string, error) {
    // Check API key
    if c.apiKey == "" {
        return "", fmt.Errorf("OPENROUTER_API_KEY not set in .env file")
    }

    messages := []Message{
        {
            Role:    "system",
            Content: "You are EduSafe AI, a helpful assistant for students learning about safety.",
        },
    }
    messages = append(messages, history...)
    messages = append(messages, Message{Role: "user", Content: userMessage})

    requestBody := OpenRouterRequest{
        Model:     c.model,
        Messages:  messages,
        MaxTokens: 500,
    }

    jsonBody, err := json.Marshal(requestBody)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(jsonBody))
    if err != nil {
        return "", err
    }

    req.Header.Set("Content-Type", "application/json")
    // OpenRouter accepts both Bearer and X-OpenRouter-Key
    req.Header.Set("Authorization", "Bearer "+c.apiKey)
    req.Header.Set("HTTP-Referer", "http://localhost:8080")
    req.Header.Set("X-Title", "EduSafe AI")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    bodyBytes, _ := io.ReadAll(resp.Body)
    
    log.Printf("OpenRouter response status: %s", resp.Status)
    
    if resp.StatusCode != http.StatusOK {
        // Log full response for debugging
        log.Printf("Response body: %s", string(bodyBytes))
        return "", fmt.Errorf("OpenRouter error %s: %s", resp.Status, string(bodyBytes))
    }

    var openRouterResp OpenRouterResponse
    if err := json.Unmarshal(bodyBytes, &openRouterResp); err != nil {
        return "", fmt.Errorf("decode error: %w", err)
    }

    if openRouterResp.Error != nil {
        return "", fmt.Errorf("OpenRouter error: %s", openRouterResp.Error.Message)
    }

    if len(openRouterResp.Choices) == 0 {
        return "", fmt.Errorf("no response choices")
    }

    return openRouterResp.Choices[0].Message.Content, nil
}