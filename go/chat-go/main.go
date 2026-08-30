package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/topolgira/chat-go/repository"
	"golang.org/x/net/websocket"
)

const FILE_PATH = "main.go"

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

type ConnectionManager struct {
	mu          sync.RWMutex
	connections map[string]*websocket.Conn // Key: UserID
}

func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		connections: make(map[string]*websocket.Conn),
	}
}

func (cm *ConnectionManager) Register(userID string, ws *websocket.Conn) {
	start := time.Now()
	cm.mu.Lock()
	defer cm.mu.Unlock()
	key := strings.TrimSpace(userID)
	cm.connections[key] = ws
	slog.Info("👉 [Fn ENTER] ConnectionManager.Register",
		slog.String("fn", "Register"),
		slog.String("file", FILE_PATH),
		slog.String("user_id", key),
		slog.Int("total_connected_clients", len(cm.connections)),
		slog.Duration("duration", time.Since(start)),
	)
}

func (cm *ConnectionManager) Unregister(userID string) {
	start := time.Now()
	cm.mu.Lock()
	defer cm.mu.Unlock()
	key := strings.TrimSpace(userID)
	delete(cm.connections, key)
	slog.Info("👈 [Fn EXIT] ConnectionManager.Unregister",
		slog.String("fn", "Unregister"),
		slog.String("file", FILE_PATH),
		slog.String("user_id", key),
		slog.Int("total_connected_clients", len(cm.connections)),
		slog.Duration("duration", time.Since(start)),
	)
}

func (cm *ConnectionManager) Broadcast(senderID string, msg repository.ChatMessagePayload) int {
	start := time.Now()
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	data, err := json.Marshal(msg)
	if err != nil {
		slog.Error("Failed to marshal broadcast payload", slog.String("error", err.Error()))
		return 0
	}

	deliveredCount := 0
	senderKey := strings.TrimSpace(senderID)

	for uid, ws := range cm.connections {
		if ws != nil {
			if err := websocket.Message.Send(ws, string(data)); err == nil {
				deliveredCount++
			} else {
				slog.Warn("Failed to deliver WS message to client", slog.String("uid", uid), slog.String("error", err.Error()))
			}
		}
	}

	slog.Info("📢 [Realtime Broadcast Delivered]",
		slog.String("sender_id", senderKey),
		slog.String("receiver_id", msg.ReceiverID),
		slog.String("content", msg.Content),
		slog.Int("recipients_delivered", deliveredCount),
		slog.Duration("duration", time.Since(start)),
	)

	return deliveredCount
}

type ChatServer struct {
	manager *ConnectionManager
	msgRepo repository.MessageRepository
}

func NewChatServer(repo repository.MessageRepository) *ChatServer {
	return &ChatServer{
		manager: NewConnectionManager(),
		msgRepo: repo,
	}
}

func (cs *ChatServer) handleWS(ws *websocket.Conn) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] handleWS Connection Handshake", slog.String("fn", "handleWS"), slog.String("file", FILE_PATH))
	defer func() {
		ws.Close()
		slog.Info("👈 [Fn EXIT] handleWS Connection Closed", slog.String("fn", "handleWS"), slog.Duration("duration", time.Since(start)))
	}()

	var currentUserID string

	for {
		var reply string
		if err := websocket.Message.Receive(ws, &reply); err != nil {
			if currentUserID != "" {
				cs.manager.Unregister(currentUserID)
			}
			break
		}

		var payload repository.ChatMessagePayload
		if err := json.Unmarshal([]byte(reply), &payload); err != nil {
			slog.Error("Failed to decode JSON WS payload", slog.String("raw", reply), slog.String("error", err.Error()))
			continue
		}

		switch payload.Type {
		case "auth":
			if payload.SenderID != "" {
				currentUserID = strings.TrimSpace(payload.SenderID)
				cs.manager.Register(currentUserID, ws)

				ack := repository.ChatMessagePayload{
					Type:       "ack",
					SenderID:   "system",
					ReceiverID: currentUserID,
					Content:    "Authenticated successfully",
					Timestamp:  time.Now().Unix(),
					Status:     "CONNECTED",
				}
				data, _ := json.Marshal(ack)
				_ = websocket.Message.Send(ws, string(data))
			}

		case "message":
			if payload.Content != "" {
				if payload.Timestamp == 0 {
					payload.Timestamp = time.Now().Unix()
				}

				// 1. Persist message via DI repository
				_ = cs.msgRepo.SaveMessage(payload)

				// 2. Broadcast message live in real-time to all connected clients
				deliveredCount := cs.manager.Broadcast(payload.SenderID, payload)

				// 3. Send ACK back to sender
				status := "SENT"
				if deliveredCount > 0 {
					status = "DELIVERED"
				}

				ack := repository.ChatMessagePayload{
					Type:       "ack",
					ChatID:     payload.ChatID,
					SenderID:   "system",
					ReceiverID: payload.SenderID,
					Content:    payload.Content,
					Timestamp:  time.Now().Unix(),
					Status:     status,
				}
				data, _ := json.Marshal(ack)
				_ = websocket.Message.Send(ws, string(data))
			}
		}
	}
}

func (cs *ChatServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Message: "Topolgira Go Realtime Chat Gateway Healthy",
		Data: map[string]interface{}{
			"service":            "chat-go",
			"active_connections": len(cs.manager.connections),
			"driver":             getDriver(),
		},
	})
}

func getDriver() string {
	d := os.Getenv("DB_DRIVER")
	if d == "" {
		d = "json"
	}
	return d
}

func processEnv() string {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = os.Getenv("NODE_ENV")
	}
	if env == "" {
		env = "development"
	}
	return env
}

func initLogger() {
	var handler slog.Handler
	if processEnv() == "production" {
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
		port = "9000"
	}

	driver := getDriver()
	dbConfig := os.Getenv("REDIS_URL")
	if driver == "json" && dbConfig == "" {
		dbConfig = "chat_messages.json"
	}

	// Dependency Injection Manual Wiring
	msgRepo := repository.NewMessageRepository(driver, dbConfig)
	chatServer := NewChatServer(msgRepo)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", chatServer.handleHealth)
	mux.Handle("/ws", websocket.Handler(chatServer.handleWS))
	mux.Handle("/", http.FileServer(http.Dir("./static")))

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("🚀 Topolgira Go Realtime Chat Gateway listening",
			slog.String("port", port),
			slog.String("ui_url", fmt.Sprintf("http://localhost:%s", port)),
			slog.String("driver", driver),
			slog.String("env", processEnv()),
		)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Received shutdown signal. Stopping Go Realtime Chat Gateway...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = server.Shutdown(ctx)
	slog.Info("Server stopped cleanly")
}
