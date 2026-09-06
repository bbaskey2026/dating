package domain

type RegisterRequest struct {
	Email            string   `json:"email"`
	Password         string   `json:"password"`
	PhoneNumber      string   `json:"phoneNumber,omitempty"`
	Name             string   `json:"name,omitempty"`
	Age              int      `json:"age,omitempty"`
	Gender           string   `json:"gender,omitempty"`
	City             string   `json:"city,omitempty"`
	Bio              string   `json:"bio,omitempty"`
	Education        string   `json:"education,omitempty"`
	Profession       string   `json:"profession,omitempty"`
	RelationshipGoal string   `json:"relationshipGoal,omitempty"`
	Interests        []string `json:"interests,omitempty"`
	Languages        []string `json:"languages,omitempty"`
	Hobbies          []string `json:"hobbies,omitempty"`
	FoodPreferences  []string `json:"foodPreferences,omitempty"`
	MusicInterests   []string `json:"musicInterests,omitempty"`
	Photos           []string `json:"photos,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	Name             *string          `json:"name,omitempty"`
	Age              *int             `json:"age,omitempty"`
	Gender           *string          `json:"gender,omitempty"`
	City             *string          `json:"city,omitempty"`
	Bio              *string          `json:"bio,omitempty"`
	Education        *string          `json:"education,omitempty"`
	Profession       *string          `json:"profession,omitempty"`
	RelationshipGoal *string          `json:"relationshipGoal,omitempty"`
	Interests        []string         `json:"interests,omitempty"`
	Languages        []string         `json:"languages,omitempty"`
	Hobbies          []string         `json:"hobbies,omitempty"`
	FoodPreferences  []string         `json:"foodPreferences,omitempty"`
	MusicInterests   []string         `json:"musicInterests,omitempty"`
	Photos           []string         `json:"photos,omitempty"`
	Location         *Location        `json:"location,omitempty"`
	Preferences      *UserPreferences `json:"preferences,omitempty"`
	PhoneNumber      *string          `json:"phoneNumber,omitempty"`
	IsVerified       *bool            `json:"isVerified,omitempty"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type UpdateStatusRequest struct {
	Status UserStatus `json:"status"`
	Role   *UserRole  `json:"role,omitempty"`
}

type UserQueryFilter struct {
	Status    string
	Role      string
	City      string
	Gender    string
	MinAge    int
	MaxAge    int
	Search    string
	Page      int
	Limit     int
}

type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type PaginatedUsersResponse struct {
	Users      []*User `json:"users"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	TotalPages int     `json:"totalPages"`
}

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}
