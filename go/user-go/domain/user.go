package domain

type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleAdmin     UserRole = "admin"
	RoleModerator UserRole = "moderator"
)

type UserStatus string

const (
	StatusActive      UserStatus = "active"
	StatusPending     UserStatus = "pending"
	StatusSuspended   UserStatus = "suspended"
	StatusDeactivated UserStatus = "deactivated"
)

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      string  `json:"city"`
	Country   string  `json:"country"`
}

type UserPreferences struct {
	MinAge            int      `json:"minAge"`
	MaxAge            int      `json:"maxAge"`
	MaxDistanceKm     float64  `json:"maxDistanceKm"`
	PreferredGenders  []string `json:"preferredGenders"`
	RelationshipGoals []string `json:"relationshipGoals"`
}

type UserProfile struct {
	ID                string          `json:"id"`
	UserID            string          `json:"userId"`
	Name              string          `json:"name"`
	Age               int             `json:"age"`
	Gender            string          `json:"gender"`
	City              string          `json:"city"`
	Location          Location        `json:"location"`
	Education         string          `json:"education"`
	Profession        string          `json:"profession"`
	RelationshipGoal  string          `json:"relationshipGoal"`
	Bio               string          `json:"bio"`
	Interests         []string        `json:"interests"`
	Languages         []string        `json:"languages"`
	Hobbies           []string        `json:"hobbies"`
	FoodPreferences   []string        `json:"foodPreferences"`
	MusicInterests    []string        `json:"musicInterests"`
	Photos            []string        `json:"photos"`
	Preferences       UserPreferences `json:"preferences"`
	CreatedAt         string          `json:"createdAt"`
	UpdatedAt         string          `json:"updatedAt"`
}

type User struct {
	ID           string       `json:"id"`
	Email        string       `json:"email"`
	PasswordHash string       `json:"-"`
	PhoneNumber  string       `json:"phoneNumber,omitempty"`
	Role         UserRole     `json:"role"`
	Status       UserStatus   `json:"status"`
	IsVerified   bool         `json:"isVerified"`
	Profile      *UserProfile `json:"profile,omitempty"`
	CreatedAt    string       `json:"createdAt"`
	UpdatedAt    string       `json:"updatedAt"`
}
