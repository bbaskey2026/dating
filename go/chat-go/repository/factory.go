package repository

import (
	"log/slog"
	"strings"
)

// NewMessageRepository is a Manual Wiring Dependency Injection Factory
// Dynamically switches between JSON file database (chat_messages.json) and Redis / DB storage
func NewMessageRepository(driver, config string) MessageRepository {
	if driver == "" {
		driver = "json"
	}

	slog.Info("🔌 [DI Container] Wiring Go MessageRepository container", slog.String("driver", strings.ToUpper(driver)))

	switch strings.ToLower(driver) {
	case "redis":
		fallthrough
	case "postgres":
		return NewRedisMessageRepository(config)
	case "json":
		fallthrough
	default:
		return NewJsonMessageRepository(config)
	}
}
