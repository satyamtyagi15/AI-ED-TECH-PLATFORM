package handlers

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    "edusafe-ai/ai"
)

type GenerateQuizRequest struct {
    Content       string   `json:"content"`
    Grade         string   `json:"grade"`
    NumQuestions  int      `json:"numQuestions"`
    QuestionTypes []string `json:"questionTypes"`
}

type GenerateQuizResponse struct {
    Title        string `json:"title"`
    Description  string `json:"description"`
    Questions    []struct {
        Text                string   `json:"text"`
        Options             []string `json:"options"`
        CorrectAnswerIndex  int      `json:"correctAnswerIndex"`
        QuestionType        string   `json:"questionType"` // "mcq", "truefalse", "short", "long"
    } `json:"questions"`
    TimeLimit    int `json:"timeLimit"`
    PassingScore int `json:"passingScore"`
    Category     string `json:"category"`
    XpReward     int    `json:"xpReward"`
}

func (h *ChatHandler) GenerateQuiz(c *gin.Context) {
    var req GenerateQuizRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    prompt := fmt.Sprintf(`You are an expert exam creator. Based on the following content, create a %d-question quiz for grade %s.
The quiz must include exactly the following question types: %v.
The output must be strict JSON with the following structure. For each question, include a "questionType" field.

RULES:
- For "mcq" (multiple choice): provide "options" array with 4 choices, and "correctAnswerIndex" (0‑based).
- For "truefalse": provide "options": ["True", "False"], and "correctAnswerIndex" (0 for True, 1 for False).
- For "short" and "long": provide an empty "options" array, and set "correctAnswerIndex" to 0 (will be ignored). The question text should be clear and open‑ended.

Example JSON:
{
  "title": "Quiz Title",
  "description": "Description",
  "questions": [
    { "text": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "correctAnswerIndex": 0, "questionType": "mcq" },
    { "text": "The sky is green.", "options": ["True", "False"], "correctAnswerIndex": 1, "questionType": "truefalse" },
    { "text": "Explain why urban farming can increase food resilience.", "options": [], "correctAnswerIndex": 0, "questionType": "long" }
  ],
  "timeLimit": 30,
  "passingScore": 60,
  "category": "general",
  "xpReward": 100
}

Content:
%s`, req.NumQuestions, req.Grade, req.QuestionTypes, req.Content)

    aiClient := ai.NewAIClient()
    aiResp, err := aiClient.SendMessage(prompt, nil)
    if err != nil {
        log.Printf("AI generation error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service failed"})
        return
    }

    var quizResp GenerateQuizResponse
    jsonStart := bytes.Index([]byte(aiResp), []byte("{"))
    jsonEnd := bytes.LastIndex([]byte(aiResp), []byte("}"))
    if jsonStart >= 0 && jsonEnd > jsonStart {
        jsonPart := aiResp[jsonStart : jsonEnd+1]
        if err := json.Unmarshal([]byte(jsonPart), &quizResp); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "raw": aiResp})
            return
        }
    } else {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response format", "raw": aiResp})
        return
    }

    c.JSON(http.StatusOK, quizResp)
}

// Daily challenge endpoint (unchanged)
type DailyChallengeRequest struct {
    TenantId string `json:"tenantId"`
}

type DailyChallengeResponse struct {
    Title       string `json:"title"`
    Description string `json:"description"`
    Question    string `json:"question"`
    Answer      string `json:"answer"`
    XpReward    int    `json:"xpReward"`
}

func (h *ChatHandler) GenerateDailyChallenge(c *gin.Context) {
    var req DailyChallengeRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    prompt := `Create a short, fun, educational challenge for a student. The challenge should be a single question with a short answer (one word or a few words). Return strict JSON:
{
  "title": "Challenge title (e.g. 'Quick Math')",
  "description": "One sentence explaining the task.",
  "question": "The question text.",
  "answer": "The correct answer (all lowercase).",
  "xpReward": 50
}`

    aiClient := ai.NewAIClient()
    aiResp, err := aiClient.SendMessage(prompt, nil)
    if err != nil {
        log.Printf("Daily challenge generation error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service failed"})
        return
    }

    var challenge DailyChallengeResponse
    jsonStart := bytes.Index([]byte(aiResp), []byte("{"))
    jsonEnd := bytes.LastIndex([]byte(aiResp), []byte("}"))
    if jsonStart >= 0 && jsonEnd > jsonStart {
        jsonPart := aiResp[jsonStart : jsonEnd+1]
        if err := json.Unmarshal([]byte(jsonPart), &challenge); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Parsing failed", "raw": aiResp})
            return
        }
    } else {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid response format", "raw": aiResp})
        return
    }

    c.JSON(http.StatusOK, challenge)
}