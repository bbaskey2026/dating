package repository

import (
	"log/slog"
	"strings"
)

// NewUserRepository is a Manual Wiring Dependency Injection Factory
// Dynamically switches between JSON file database (users.json) and PostgreSQL real database schema
func NewUserRepository(driver, config string) UserRepository {
	if driver == "" {
		driver = "postgres"
	}

	slog.Info("🔌 [DI Container] Wiring Go UserRepository container", slog.String("driver", strings.ToUpper(driver)))

	switch strings.ToLower(driver) {
	case "postgres":
		return NewPostgresUserRepository(config)
	case "json":
		fallthrough
	default:
		return NewJsonUserRepository(config)
	}
}
