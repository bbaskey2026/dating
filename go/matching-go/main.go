package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/topolgira/matching-go/engine"
)

type RecommendationRequest struct {
	Target     engine.Profile   `json:"target"`
	Candidates []engine.Profile `json:"candidates"`
}

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

type MatchingServer struct {
	matchingEngine engine.MatchingEngine
}

func NewMatchingServer(e engine.MatchingEngine) *MatchingServer {
	return &MatchingServer{matchingEngine: e}
}

func CORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Version, X-Request-Id, X-Requested-With, Accept, Origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func (s *MatchingServer) handleRecommendations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	var req RecommendationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ApiResponse{Success: false, Error: "Invalid JSON payload: " + err.Error()})
		return
	}

	results := s.matchingEngine.RankCandidates(req.Target, req.Candidates)

	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: fmt.Sprintf("Calculated %d match recommendations", len(results)),
		Data:    results,
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: "Topolgira Go Matching Engine Service Healthy",
		Data: map[string]string{
			"service": "matching-go",
			"engine":  getEngineType(),
		},
	})
}

func getEngineType() string {
	e := os.Getenv("MATCH_ENGINE")
	if e == "" {
		e = "jaccard"
	}
	return e
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
		port = "8080"
	}

	engineType := getEngineType()

	// Dependency Injection Manual Wiring
	matchingEngine := engine.NewMatchingEngine(engineType)
	serverInstance := NewMatchingServer(matchingEngine)

	http.HandleFunc("/health", CORS(handleHealth))
	http.HandleFunc("/api/v1/recommendations", CORS(serverInstance.handleRecommendations))

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("🚀 Topolgira Go Matching Engine listening",
			slog.String("port", port),
			slog.String("engineType", engineType),
		)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Received shutdown signal. Stopping Go Matching Engine...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = server.Shutdown(ctx)
	slog.Info("Server stopped cleanly")
}
