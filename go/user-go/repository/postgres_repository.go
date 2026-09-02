package repository

import (
	"log/slog"
)

const PG_FILE_PATH = "repository/postgres_repository.go"

type PostgresUserRepository struct {
	connStr  string
	fallback *JsonUserRepository
}

func NewPostgresUserRepository(connStr string) *PostgresUserRepository {
	if connStr == "" {
		connStr = "postgres://postgres:postgres@localhost:5432/topolgira"
	}
	return &PostgresUserRepository{
		connStr:  connStr,
		fallback: NewJsonUserRepository("postgres_emulated_users.json"),
	}
}

func (r *PostgresUserRepository) Create(payload RegisterUserPayload) (*UserRecord, error) {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.Create", slog.String("fn", "Create"), slog.String("file", PG_FILE_PATH), slog.String("connStr", r.connStr), slog.String("email", payload.Email))
	return r.fallback.Create(payload)
}

func (r *PostgresUserRepository) Authenticate(email, password string) (*UserRecord, error) {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.Authenticate", slog.String("fn", "Authenticate"), slog.String("file", PG_FILE_PATH), slog.String("email", email))
	return r.fallback.Authenticate(email, password)
}

func (r *PostgresUserRepository) GetByID(id string) (*UserRecord, bool) {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.GetByID", slog.String("fn", "GetByID"), slog.String("file", PG_FILE_PATH), slog.String("id", id))
	return r.fallback.GetByID(id)
}

func (r *PostgresUserRepository) List(status, role, city string, page, limit int) ([]*UserRecord, int) {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.List", slog.String("fn", "List"), slog.String("file", PG_FILE_PATH))
	return r.fallback.List(status, role, city, page, limit)
}

func (r *PostgresUserRepository) Update(id string, updates map[string]interface{}) (*UserRecord, error) {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.Update", slog.String("fn", "Update"), slog.String("file", PG_FILE_PATH), slog.String("id", id))
	return r.fallback.Update(id, updates)
}

func (r *PostgresUserRepository) Delete(id string) bool {
	slog.Info("👉 [Fn ENTER] PostgresUserRepository.Delete", slog.String("fn", "Delete"), slog.String("file", PG_FILE_PATH), slog.String("id", id))
	return r.fallback.Delete(id)
}
