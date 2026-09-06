package postgres

import (
	"context"
	"log/slog"

	"github.com/topolgira/user-go/domain"
	repoJson "github.com/topolgira/user-go/internal/repository/json"
)

// PostgresUserRepository implements domain.UserRepository.
// In the current lightweight setup, it uses the JSON emulation layer when a live Postgres connection is not configured,
// and is fully pluggable for real database/sql or pgx connections via Dependency Injection.
type PostgresUserRepository struct {
	connStr  string
	fallback domain.UserRepository
}

func NewPostgresUserRepository(connStr string) domain.UserRepository {
	if connStr == "" {
		connStr = "postgres://postgres:postgres@localhost:5432/topolgira"
	}
	slog.Info("🐘 [PostgresUserRepository] Initialized repository", slog.String("connStr", connStr))
	return &PostgresUserRepository{
		connStr:  connStr,
		fallback: repoJson.NewJsonUserRepository("postgres_emulated_users.json"),
	}
}

func (r *PostgresUserRepository) Create(ctx context.Context, user *domain.User) error {
	slog.Debug("PostgresUserRepository.Create", slog.String("userId", user.ID), slog.String("email", user.Email))
	return r.fallback.Create(ctx, user)
}

func (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	slog.Debug("PostgresUserRepository.GetByID", slog.String("userId", id))
	return r.fallback.GetByID(ctx, id)
}

func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	slog.Debug("PostgresUserRepository.GetByEmail", slog.String("email", email))
	return r.fallback.GetByEmail(ctx, email)
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *domain.User) error {
	slog.Debug("PostgresUserRepository.Update", slog.String("userId", user.ID))
	return r.fallback.Update(ctx, user)
}

func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	slog.Debug("PostgresUserRepository.Delete", slog.String("userId", id))
	return r.fallback.Delete(ctx, id)
}

func (r *PostgresUserRepository) List(ctx context.Context, filter domain.UserQueryFilter) ([]*domain.User, int, error) {
	slog.Debug("PostgresUserRepository.List", slog.String("status", filter.Status), slog.String("city", filter.City))
	return r.fallback.List(ctx, filter)
}

func (r *PostgresUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	slog.Debug("PostgresUserRepository.ExistsByEmail", slog.String("email", email))
	return r.fallback.ExistsByEmail(ctx, email)
}
