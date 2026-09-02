package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/topolgira/user-go/repository"
)

type UserServer struct {
	repo repository.UserRepository
}

func NewUserServer(repo repository.UserRepository) *UserServer {
	return &UserServer{repo: repo}
}

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

func RequestLoggerMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Version, X-Request-Id, X-Requested-With, Accept, Origin")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		start := time.Now()
		reqID := r.Header.Get("X-Request-Id")
		if reqID == "" {
			reqID = "req-" + hex.EncodeToString(make([]byte, 4))
		}
		w.Header().Set("X-Request-Id", reqID)

		next.ServeHTTP(w, r)

		slog.Info("HTTP Request",
			slog.String("request_id", reqID),
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Float64("duration_ms", float64(time.Since(start).Microseconds())/1000.0),
		)
	}
}

func (s *UserServer) handleRegister(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	var req repository.RegisterUserPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Email and password are required"})
		return
	}

	user, err := s.repo.Create(req)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: "User registered successfully in Go User Management System",
		Data:    user,
	})
}

func (s *UserServer) handleLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Email and password required"})
		return
	}

	user, err := s.repo.Authenticate(req.Email, req.Password)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: "Authentication successful",
		Data: map[string]interface{}{
			"user":  user,
			"token": "go_jwt_token_" + user.ID,
		},
	})
}

func (s *UserServer) handleUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		status := r.URL.Query().Get("status")
		role := r.URL.Query().Get("role")
		city := r.URL.Query().Get("city")
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit < 1 || limit > 100 {
			limit = 20
		}

		users, total := s.repo.List(status, role, city, page, limit)
		json.NewEncoder(w).Encode(ApiResponse{
			Success: true,
			Data: map[string]interface{}{
				"total": total,
				"page":  page,
				"limit": limit,
				"users": users,
			},
		})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Method not allowed"})
	}
}

func (s *UserServer) handleUserDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Invalid URL path"})
		return
	}
	userID := parts[4]

	switch r.Method {
	case http.MethodGet:
		user, exists := s.repo.GetByID(userID)
		if !exists {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "User not found"})
			return
		}
		json.NewEncoder(w).Encode(ApiResponse{Success: true, Data: user})

	case http.MethodPatch:
		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Invalid JSON body"})
			return
		}
		user, err := s.repo.Update(userID, updates)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: err.Error()})
			return
		}
		json.NewEncoder(w).Encode(ApiResponse{Success: true, Message: "User updated", Data: user})

	case http.MethodDelete:
		if success := s.repo.Delete(userID); !success {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "User not found"})
			return
		}
		json.NewEncoder(w).Encode(ApiResponse{Success: true, Message: "User deactivated successfully"})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Method not allowed"})
	}
}

func (s *UserServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: "Topolgira Go User Management Service Healthy",
		Data: map[string]interface{}{
			"service": "user-go",
			"driver":  getDriver(),
		},
	})
}

func getDriver() string {
	d := os.Getenv("DB_DRIVER")
	if d == "" {
		d = "postgres"
	}
	return d
}

func initLogger() {
	var handler slog.Handler
	if os.Getenv("GO_ENV") == "production" || os.Getenv("NODE_ENV") == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}
	slog.SetDefault(slog.New(handler))
}

func main() {
	initLogger()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	driver := getDriver()
	dbConfig := os.Getenv("DATABASE_URL")
	if dbConfig == "" {
		if driver == "postgres" {
			dbConfig = "postgres://postgres:postgres@localhost:5432/topolgira"
		} else {
			dbConfig = "users.json"
		}
	}

	// Manual Wiring Dependency Injection
	repo := repository.NewUserRepository(driver, dbConfig)

	// Seed initial admin & user accounts
	_, _ = repo.Create(repository.RegisterUserPayload{Email: "admin@topolgira.com", Password: "admin123", PhoneNumber: "+919999900000"})
	_, _ = repo.Create(repository.RegisterUserPayload{Email: "bhima@topolgira.com", Password: "user123", PhoneNumber: "+919999911111"})

	serverInstance := NewUserServer(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", RequestLoggerMiddleware(serverInstance.handleHealth))
	mux.HandleFunc("/api/v1/users/register", RequestLoggerMiddleware(serverInstance.handleRegister))
	mux.HandleFunc("/api/v1/users/login", RequestLoggerMiddleware(serverInstance.handleLogin))
	mux.HandleFunc("/api/v1/users", RequestLoggerMiddleware(serverInstance.handleUsers))
	mux.HandleFunc("/api/v1/users/", RequestLoggerMiddleware(serverInstance.handleUserDetail))

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("🚀 Topolgira Go User Management Service started",
			slog.String("port", port),
			slog.String("driver", driver),
		)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Received shutdown signal. Stopping Go User Management Service...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = server.Shutdown(ctx)
	slog.Info("Server stopped cleanly")
}
