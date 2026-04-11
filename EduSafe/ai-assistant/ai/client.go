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
        model = "meta-llama/llama-3.2-3b-instruct"
    }
    return &AIClient{
        apiKey: apiKey,
        model:  model,
    }
}

func (c *AIClient) SendMessage(userMessage string, history []Message) (string, error) {
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
    req.Header.Set("Authorization", "Bearer "+c.apiKey)
    req.Header.Set("HTTP-Referer", "http://localhost:8080")
    req.Header.Set("X-Title", "EduSafe AI")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    log.Printf("OpenRouter response status: %s", resp.Status)

    bodyBytes, _ := io.ReadAll(resp.Body)
    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("API error %s: %s", resp.Status, string(bodyBytes))
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