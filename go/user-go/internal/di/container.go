package di

import (
	"fmt"
	"log/slog"

	"github.com/topolgira/user-go/config"
	"github.com/topolgira/user-go/domain"
	"github.com/topolgira/user-go/internal/handler"
	repoJson "github.com/topolgira/user-go/internal/repository/json"
	repoMem "github.com/topolgira/user-go/internal/repository/memory"
	repoPg "github.com/topolgira/user-go/internal/repository/postgres"
	"github.com/topolgira/user-go/internal/security"
	"github.com/topolgira/user-go/internal/service"
)

// Container manages application dependencies using manual dependency injection.
type Container struct {
	Config         *config.Config
	UserRepository domain.UserRepository
	PasswordHasher domain.PasswordHasher
	TokenProvider  domain.TokenProvider
	UserService    domain.UserService
	UserHandler    *handler.UserHandler
	AuthMiddleware *handler.AuthMiddleware
}

// NewContainer initializes and wires all dependencies according to the provided configuration.
func NewContainer(cfg *config.Config) (*Container, error) {
	if cfg == nil {
		cfg = config.Load()
	}

	slog.Info("Initializing DI Container",
		slog.String("driver", cfg.DBDriver),
		slog.String("port", cfg.Port),
		slog.String("env", cfg.Environment),
	)

	// 1. Initialize UserRepository based on driver
	var userRepo domain.UserRepository
	switch cfg.DBDriver {
	case "memory":
		userRepo = repoMem.NewMemoryUserRepository()
	case "postgres":
		userRepo = repoPg.NewPostgresUserRepository(cfg.DatabaseURL)
	case "json":
		userRepo = repoJson.NewJsonUserRepository(cfg.DatabaseURL)
	default:
		slog.Warn("Unknown DB_DRIVER, defaulting to JSON repository", slog.String("driver", cfg.DBDriver))
		userRepo = repoJson.NewJsonUserRepository(cfg.DatabaseURL)
	}

	// 2. Initialize Security dependencies
	hasher := security.NewStandardPasswordHasher(10000)
	tokenProvider := security.NewJWTTokenProvider(cfg.JWTSecret, cfg.JWTExpiresIn)

	// 3. Initialize Domain Services
	userService := service.NewUserService(userRepo, hasher, tokenProvider)

	// 4. Initialize Handlers and Middleware
	userHandler := handler.NewUserHandler(userService, cfg.DBDriver)
	authMiddleware := handler.NewAuthMiddleware(tokenProvider)

	return &Container{
		Config:         cfg,
		UserRepository: userRepo,
		PasswordHasher: hasher,
		TokenProvider:  tokenProvider,
		UserService:    userService,
		UserHandler:    userHandler,
		AuthMiddleware: authMiddleware,
	}, nil
}

// MustNewContainer creates a new Container and panics if an error occurs.
func MustNewContainer(cfg *config.Config) *Container {
	c, err := NewContainer(cfg)
	if err != nil {
		panic(fmt.Sprintf("failed to initialize DI container: %v", err))
	}
	return c
}