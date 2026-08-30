package main

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/topolgira/chat-go/repository"
)

func TestChatMessagePayloadSerialization(t *testing.T) {
	rawJSON := `{
		"type": "message",
		"chatId": "chat123",
		"senderId": "userA",
		"receiverId": "userB",
		"content": "Johar!",
		"timestamp": 1756531200
	}`

	var payload repository.ChatMessagePayload
	err := json.Unmarshal([]byte(rawJSON), &payload)
	if err != nil {
		t.Fatalf("Failed to unmarshal chat payload JSON: %v", err)
	}

	if payload.Type != "message" {
		t.Errorf("Expected payload type 'message', got '%s'", payload.Type)
	}
	if payload.SenderID != "userA" {
		t.Errorf("Expected senderId 'userA', got '%s'", payload.SenderID)
	}
	if payload.ReceiverID != "userB" {
		t.Errorf("Expected receiverId 'userB', got '%s'", payload.ReceiverID)
	}
	if payload.Content != "Johar!" {
		t.Errorf("Expected content 'Johar!', got '%s'", payload.Content)
	}
}

func TestChatDependencyInjection(t *testing.T) {
	testFile := fmt.Sprintf("test_chat_messages_%d.json", time.Now().UnixNano())
	defer os.Remove(testFile)

	jsonRepo := repository.NewMessageRepository("json", testFile)
	msg := repository.ChatMessagePayload{
		Type:       "message",
		ChatID:     "c1",
		SenderID:   "u1",
		ReceiverID: "u2",
		Content:    "Hello DI!",
	}

	err := jsonRepo.SaveMessage(msg)
	if err != nil {
		t.Errorf("Expected SaveMessage to succeed, got %v", err)
	}

	history, errHist := jsonRepo.GetChatHistory("c1", 10)
	if errHist != nil || len(history) != 1 {
		t.Errorf("Expected 1 message in history, got %d", len(history))
	}
}
