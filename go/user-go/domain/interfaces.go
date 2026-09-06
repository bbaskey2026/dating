package domain

import "context"

// UserRepository defines the interface for persisting and retrieving user entities.
type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, filter UserQueryFilter) ([]*User, int, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}

// PasswordHasher defines the interface for secure password operations.
type PasswordHasher interface {
	HashPassword(password string) (string, error)
	ComparePassword(hashedPassword, password string) bool
}

// TokenClaims represents the claims encoded in an authentication token.
type TokenClaims struct {
	UserID string   `json:"userId"`
	Email  string   `json:"email"`
	Role   UserRole `json:"role"`
}

// TokenProvider defines the interface for generating and validating authentication tokens.
type TokenProvider interface {
	GenerateToken(claims TokenClaims) (string, error)
	ValidateToken(tokenString string) (*TokenClaims, error)
}

// UserService defines the business logic interface for user operations.
type UserService interface {
	Register(ctx context.Context, req RegisterRequest) (*User, error)
	Authenticate(ctx context.Context, req LoginRequest) (*AuthResponse, error)
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	UpdateProfile(ctx context.Context, id string, req UpdateProfileRequest) (*User, error)
	ChangePassword(ctx context.Context, id string, req ChangePasswordRequest) error
	UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) (*User, error)
	ListUsers(ctx context.Context, filter UserQueryFilter) (*PaginatedUsersResponse, error)
	DeleteUser(ctx context.Context, id string) error
}
