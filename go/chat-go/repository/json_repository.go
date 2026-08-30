package repository

import (
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"
)

const FILE_PATH = "repository/json_repository.go"

type JsonMessageRepository struct {
	mu       sync.RWMutex
	filePath string
	messages map[string][]ChatMessagePayload // Key: ChatID
}

func NewJsonMessageRepository(filePath string) *JsonMessageRepository {
	if filePath == "" {
		filePath = "chat_messages.json"
	}
	repo := &JsonMessageRepository{
		filePath: filePath,
		messages: make(map[string][]ChatMessagePayload),
	}
	repo.load()
	return repo
}

func (r *JsonMessageRepository) load() {
	if data, err := os.ReadFile(r.filePath); err == nil {
		_ = json.Unmarshal(data, &r.messages)
	}
}

func (r *JsonMessageRepository) save() {
	data, err := json.MarshalIndent(r.messages, "", "  ")
	if err == nil {
		_ = os.MkdirAll(filepath.Dir(r.filePath), 0755)
		_ = os.WriteFile(r.filePath, data, 0644)
	}
}

func (r *JsonMessageRepository) SaveMessage(msg ChatMessagePayload) error {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonMessageRepository.SaveMessage", slog.String("fn", "SaveMessage"), slog.String("file", FILE_PATH), slog.String("chatId", msg.ChatID))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonMessageRepository.SaveMessage", slog.String("fn", "SaveMessage"), slog.String("file", FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.Lock()
	defer r.mu.Unlock()

	chatID := msg.ChatID
	if chatID == "" {
		chatID = "global"
	}

	r.messages[chatID] = append(r.messages[chatID], msg)
	r.save()
	return nil
}

func (r *JsonMessageRepository) GetChatHistory(chatID string, limit int) ([]ChatMessagePayload, error) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonMessageRepository.GetChatHistory", slog.String("fn", "GetChatHistory"), slog.String("file", FILE_PATH), slog.String("chatId", chatID))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonMessageRepository.GetChatHistory", slog.String("fn", "GetChatHistory"), slog.String("file", FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.RLock()
	defer r.mu.RUnlock()

	msgs := r.messages[chatID]
	if limit > 0 && len(msgs) > limit {
		msgs = msgs[len(msgs)-limit:]
	}
	return msgs, nil
}
