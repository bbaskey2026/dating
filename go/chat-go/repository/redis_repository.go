package repository

import (
	"log/slog"
)

const REDIS_FILE_PATH = "repository/redis_repository.go"

type RedisMessageRepository struct {
	redisURL string
	fallback *JsonMessageRepository
}

func NewRedisMessageRepository(redisURL string) *RedisMessageRepository {
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	return &RedisMessageRepository{
		redisURL: redisURL,
		fallback: NewJsonMessageRepository("redis_emulated_messages.json"),
	}
}

func (r *RedisMessageRepository) SaveMessage(msg ChatMessagePayload) error {
	slog.Info("👉 [Fn ENTER] RedisMessageRepository.SaveMessage", slog.String("fn", "SaveMessage"), slog.String("file", REDIS_FILE_PATH), slog.String("redisURL", r.redisURL))
	return r.fallback.SaveMessage(msg)
}

func (r *RedisMessageRepository) GetChatHistory(chatID string, limit int) ([]ChatMessagePayload, error) {
	slog.Info("👉 [Fn ENTER] RedisMessageRepository.GetChatHistory", slog.String("fn", "GetChatHistory"), slog.String("file", REDIS_FILE_PATH), slog.String("chatID", chatID))
	return r.fallback.GetChatHistory(chatID, limit)
}
