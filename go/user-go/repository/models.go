package repository

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

type UserRecord struct {
	ID           string       `json:"id"`
	Email        string       `json:"email"`
	PasswordHash string       `json:"passwordHash"`
	PhoneNumber  string       `json:"phoneNumber,omitempty"`
	Role         string       `json:"role"`
	Status       string       `json:"status"`
	IsVerified   bool         `json:"isVerified"`
	Profile      *UserProfile `json:"profile,omitempty"`
	CreatedAt    string       `json:"createdAt"`
	UpdatedAt    string       `json:"updatedAt"`
}

type RegisterUserPayload struct {
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
