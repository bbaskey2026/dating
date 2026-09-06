package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/topolgira/user-go/domain"
)

// UserHandler handles HTTP transport for user operations.
// All business logic is delegated to the injected domain.UserService.
type UserHandler struct {
	userService domain.UserService
	driverName  string
}

// NewUserHandler is the constructor for UserHandler, receiving UserService via DI.
func NewUserHandler(userService domain.UserService, driverName string) *UserHandler {
	return &UserHandler{
		userService: userService,
		driverName:  driverName,
	}
}

// RegisterRouter mounts all endpoints onto the provided http.ServeMux.
func (h *UserHandler) RegisterRoutes(mux *http.ServeMux, authMw *AuthMiddleware) {
	// Health
	mux.HandleFunc("/health", h.HandleHealth)

	// Auth / Registration
	mux.HandleFunc("/api/v1/auth/register", h.HandleRegister)
	mux.HandleFunc("/api/v1/users/register", h.HandleRegister)
	mux.HandleFunc("/api/v1/auth/login", h.HandleLogin)
	mux.HandleFunc("/api/v1/users/login", h.HandleLogin)

	// Users collection and sub-resources
	mux.HandleFunc("/api/v1/users", h.HandleUsersCollection)
	mux.HandleFunc("/api/v1/users/", h.HandleUserResource)
}

func (h *UserHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSONResponse(w, http.StatusOK, domain.ApiResponse{
		Success: true,
		Message: "Topolgira Go User Management Service Healthy (DI Pattern)",
		Data: map[string]interface{}{
			"service": "user-go",
			"driver":  h.driverName,
			"pattern": "Dependency Injection (DI)",
		},
	})
}

func (h *UserHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	var req domain.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Invalid JSON payload"})
		return
	}

	user, err := h.userService.Register(r.Context(), req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	writeJSONResponse(w, http.StatusCreated, domain.ApiResponse{
		Success: true,
		Message: "User registered successfully",
		Data:    user,
	})
}

func (h *UserHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	var req domain.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Invalid JSON payload"})
		return
	}

	authRes, err := h.userService.Authenticate(r.Context(), req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	writeJSONResponse(w, http.StatusOK, domain.ApiResponse{
		Success: true,
		Message: "Authentication successful",
		Data:    authRes,
	})
}

func (h *UserHandler) HandleUsersCollection(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
		return
	}

	query := r.URL.Query()
	page, _ := strconv.Atoi(query.Get("page"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	minAge, _ := strconv.Atoi(query.Get("minAge"))
	maxAge, _ := strconv.Atoi(query.Get("maxAge"))

	filter := domain.UserQueryFilter{
		Status: query.Get("status"),
		Role:   query.Get("role"),
		City:   query.Get("city"),
		Gender: query.Get("gender"),
		MinAge: minAge,
		MaxAge: maxAge,
		Search: query.Get("search"),
		Page:   page,
		Limit:  limit,
	}

	paginated, err := h.userService.ListUsers(r.Context(), filter)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	writeJSONResponse(w, http.StatusOK, domain.ApiResponse{
		Success: true,
		Data:    paginated,
	})
}

func (h *UserHandler) HandleUserResource(w http.ResponseWriter, r *http.Request) {
	// Path format: /api/v1/users/{id}[/subaction]
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	parts := strings.Split(strings.Trim(path, "/"), "/")

	if len(parts) == 0 || parts[0] == "" {
		writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Missing user ID in path"})
		return
	}

	userID := parts[0]

	// Handle special endpoint /api/v1/users/me
	if userID == "me" {
		claims, ok := r.Context().Value(UserContextKey).(*domain.TokenClaims)
		if !ok || claims == nil {
			writeJSONResponse(w, http.StatusUnauthorized, domain.ApiResponse{Success: false, Error: "Authentication required for /me"})
			return
		}
		userID = claims.UserID
	}

	// Subresource actions (e.g. /api/v1/users/{id}/password, /api/v1/users/{id}/status)
	if len(parts) > 1 {
		subAction := parts[1]
		switch subAction {
		case "password":
			if r.Method != http.MethodPut && r.Method != http.MethodPatch {
				writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
				return
			}
			var passReq domain.ChangePasswordRequest
			if err := json.NewDecoder(r.Body).Decode(&passReq); err != nil {
				writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Invalid JSON payload"})
				return
			}
			if err := h.userService.ChangePassword(r.Context(), userID, passReq); err != nil {
				handleServiceError(w, err)
				return
			}
			writeJSONResponse(w, http.StatusOK, domain.ApiResponse{Success: true, Message: "Password changed successfully"})
			return

		case "status":
			if r.Method != http.MethodPatch && r.Method != http.MethodPut {
				writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
				return
			}
			var statusReq domain.UpdateStatusRequest
			if err := json.NewDecoder(r.Body).Decode(&statusReq); err != nil {
				writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Invalid JSON payload"})
				return
			}
			updatedUser, err := h.userService.UpdateStatus(r.Context(), userID, statusReq)
			if err != nil {
				handleServiceError(w, err)
				return
			}
			writeJSONResponse(w, http.StatusOK, domain.ApiResponse{Success: true, Message: "Status updated successfully", Data: updatedUser})
			return

		default:
			writeJSONResponse(w, http.StatusNotFound, domain.ApiResponse{Success: false, Error: "Resource not found"})
			return
		}
	}

	// Root user resource: /api/v1/users/{id}
	switch r.Method {
	case http.MethodGet:
		user, err := h.userService.GetByID(r.Context(), userID)
		if err != nil {
			handleServiceError(w, err)
			return
		}
		writeJSONResponse(w, http.StatusOK, domain.ApiResponse{Success: true, Data: user})

	case http.MethodPatch, http.MethodPut:
		var updateReq domain.UpdateProfileRequest
		if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
			writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: "Invalid JSON payload"})
			return
		}
		user, err := h.userService.UpdateProfile(r.Context(), userID, updateReq)
		if err != nil {
			handleServiceError(w, err)
			return
		}
		writeJSONResponse(w, http.StatusOK, domain.ApiResponse{Success: true, Message: "User updated successfully", Data: user})

	case http.MethodDelete:
		if err := h.userService.DeleteUser(r.Context(), userID); err != nil {
			handleServiceError(w, err)
			return
		}
		writeJSONResponse(w, http.StatusOK, domain.ApiResponse{Success: true, Message: "User deactivated successfully"})

	default:
		writeJSONResponse(w, http.StatusMethodNotAllowed, domain.ApiResponse{Success: false, Error: "Method not allowed"})
	}
}

func writeJSONResponse(w http.ResponseWriter, status int, data domain.ApiResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func handleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrUserNotFound):
		writeJSONResponse(w, http.StatusNotFound, domain.ApiResponse{Success: false, Error: err.Error()})
	case errors.Is(err, domain.ErrEmailAlreadyExists):
		writeJSONResponse(w, http.StatusConflict, domain.ApiResponse{Success: false, Error: err.Error()})
	case errors.Is(err, domain.ErrInvalidCredentials), errors.Is(err, domain.ErrPasswordMismatch):
		writeJSONResponse(w, http.StatusUnauthorized, domain.ApiResponse{Success: false, Error: err.Error()})
	case errors.Is(err, domain.ErrUserDeactivated):
		writeJSONResponse(w, http.StatusForbidden, domain.ApiResponse{Success: false, Error: err.Error()})
	case errors.Is(err, domain.ErrInvalidInput):
		writeJSONResponse(w, http.StatusBadRequest, domain.ApiResponse{Success: false, Error: err.Error()})
	default:
		writeJSONResponse(w, http.StatusInternalServerError, domain.ApiResponse{Success: false, Error: err.Error()})
	}
}
