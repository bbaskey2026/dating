package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/topolgira/user-go/config"
	"github.com/topolgira/user-go/domain"
	"github.com/topolgira/user-go/internal/di"
	"github.com/topolgira/user-go/internal/handler"
)

func initLogger(env string) {
	var logHandler slog.Handler
	if env == "production" {
		logHandler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		logHandler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}
	slog.SetDefault(slog.New(logHandler))
}

func seedInitialUsers(ctx context.Context, userService domain.UserService) {
	// Seed initial admin & demo users if they don't already exist
	_, _ = userService.Register(ctx, domain.RegisterRequest{
		Email:            "admin@topolgira.com",
		Password:         "admin123",
		Name:             "System Administrator",
		PhoneNumber:      "+919999900000",
		Age:              30,
		Gender:           "male",
		City:             "Ranchi",
		Profession:       "System Architect",
		Education:        "M.Tech Computer Science",
		RelationshipGoal: "friendship",
		Bio:              "Topolgira Core Platform Admin",
		Interests:        []string{"Technology", "Architecture", "Cloud"},
	})

	_, _ = userService.Register(ctx, domain.RegisterRequest{
		Email:            "bhima@topolgira.com",
		Password:         "user123",
		Name:             "Bhima Baskey",
		PhoneNumber:      "+919999911111",
		Age:              25,
		Gender:           "male",
		City:             "Ranchi",
		Profession:       "Software Engineer",
		Education:        "B.Tech Computer Science",
		RelationshipGoal: "marriage",
		Bio:              "Passionate about software architecture, travel, and music.",
		Interests:        []string{"Music", "Travel", "Cricket"},
		Languages:        []string{"Hindi", "English", "Santhali"},
		Hobbies:          []string{"Hiking", "Guitar"},
		FoodPreferences:  []string{"Spicy", "Street Food"},
		MusicInterests:   []string{"Bollywood", "Rock"},
	})
}

func main() {
	cfg := config.Load()
	initLogger(cfg.Environment)

	slog.Info("Starting Topolgira Go User Management Service",
		slog.String("port", cfg.Port),
		slog.String("driver", cfg.DBDriver),
		slog.String("env", cfg.Environment),
	)

	// Initialize Dependency Injection container
	container, err := di.NewContainer(cfg)
	if err != nil {
		slog.Error("Failed to initialize DI container", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// Seed initial users asynchronously
	ctx := context.Background()
	seedInitialUsers(ctx, container.UserService)

	// Setup HTTP router with handlers & middleware
	mux := http.NewServeMux()
	container.UserHandler.RegisterRoutes(mux, container.AuthMiddleware)

	// Wrap root handler with CORS and Request Logger middleware
	rootHandler := handler.CORSMiddleware(handler.RequestLoggerMiddleware(mux))

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      rootHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("🚀 Topolgira Go User Management Service listening",
			slog.String("url", fmt.Sprintf("http://localhost:%s", cfg.Port)),
		)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("HTTP server error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}()

	// Graceful shutdown handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Shutdown signal received. Gracefully stopping user-go service...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		slog.Error("Server shutdown failed", slog.String("error", err.Error()))
	} else {
		slog.Info("User-Go service shutdown completed cleanly")
	}
}
