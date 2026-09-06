package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/topolgira/user-go/domain"
)

type contextKey string

const (
	UserContextKey   contextKey = "auth_user"
	RequestIDKey     contextKey = "request_id"
)

// CORSMiddleware enables CORS for cross-origin requests.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Version, X-Request-Id, X-Requested-With, Accept, Origin")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RequestLoggerMiddleware logs each incoming HTTP request with timing and request ID.
func RequestLoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		reqID := r.Header.Get("X-Request-Id")
		if reqID == "" {
			b := make([]byte, 4)
			_, _ = rand.Read(b)
			reqID = "req-" + hex.EncodeToString(b)
		}
		w.Header().Set("X-Request-Id", reqID)

		ctx := context.WithValue(r.Context(), RequestIDKey, reqID)
		next.ServeHTTP(w, r.WithContext(ctx))

		slog.Info("HTTP Request",
			slog.String("request_id", reqID),
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Float64("duration_ms", float64(time.Since(start).Microseconds())/1000.0),
		)
	})
}

// AuthMiddleware validates bearer JWT tokens and injects claims into request context.
type AuthMiddleware struct {
	tokenProvider domain.TokenProvider
}

func NewAuthMiddleware(tokenProvider domain.TokenProvider) *AuthMiddleware {
	return &AuthMiddleware{tokenProvider: tokenProvider}
}

func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSONResponse(w, http.StatusUnauthorized, domain.ApiResponse{
				Success: false,
				Error:   "Authorization header required",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := m.tokenProvider.ValidateToken(tokenString)
		if err != nil {
			writeJSONResponse(w, http.StatusUnauthorized, domain.ApiResponse{
				Success: false,
				Error:   "Invalid or expired token",
			})
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
