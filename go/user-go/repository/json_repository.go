package repository

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const JSON_FILE_PATH = "repository/json_repository.go"

type JsonUserRepository struct {
	mu       sync.RWMutex
	filePath string
	users    map[string]*UserRecord
}

func NewJsonUserRepository(filePath string) *JsonUserRepository {
	if filePath == "" {
		filePath = "users.json"
	}
	repo := &JsonUserRepository{
		filePath: filePath,
		users:    make(map[string]*UserRecord),
	}
	repo.load()
	return repo
}

func (r *JsonUserRepository) load() {
	if data, err := os.ReadFile(r.filePath); err == nil {
		var list []*UserRecord
		if err := json.Unmarshal(data, &list); err == nil {
			for _, u := range list {
				r.users[u.ID] = u
			}
		}
	}
}

func (r *JsonUserRepository) save() {
	var list []*UserRecord
	for _, u := range r.users {
		list = append(list, u)
	}
	data, err := json.MarshalIndent(list, "", "  ")
	if err == nil {
		_ = os.MkdirAll(filepath.Dir(r.filePath), 0755)
		_ = os.WriteFile(r.filePath, data, 0644)
	}
}

func (r *JsonUserRepository) Create(p RegisterUserPayload) (*UserRecord, error) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.Create", slog.String("fn", "Create"), slog.String("file", JSON_FILE_PATH), slog.String("email", p.Email))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.Create", slog.String("fn", "Create"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, p.Email) {
			return nil, fmt.Errorf("user with email %s already exists", p.Email)
		}
	}

	userID := generateUUID()
	now := time.Now().Format(time.RFC3339)

	name := p.Name
	if name == "" {
		name = strings.Split(p.Email, "@")[0]
	}
	age := p.Age
	if age <= 0 {
		age = 25
	}
	gender := p.Gender
	if gender == "" {
		gender = "other"
	}
	city := p.City
	if city == "" {
		city = "Ranchi"
	}
	goal := p.RelationshipGoal
	if goal == "" {
		goal = "marriage"
	}

	newUser := &UserRecord{
		ID:           userID,
		Email:        p.Email,
		PasswordHash: "hashed_" + p.Password,
		PhoneNumber:  p.PhoneNumber,
		Role:         "user",
		Status:       "active",
		IsVerified:   false,
		Profile: &UserProfile{
			ID:               generateUUID(),
			UserID:           userID,
			Name:             name,
			Age:              age,
			Gender:           gender,
			City:             city,
			Location:         Location{Latitude: 23.3441, Longitude: 85.3096, City: city, Country: "India"},
			Education:        p.Education,
			Profession:       p.Profession,
			RelationshipGoal: goal,
			Bio:              p.Bio,
			Interests:        p.Interests,
			Languages:        p.Languages,
			Hobbies:          p.Hobbies,
			FoodPreferences:  p.FoodPreferences,
			MusicInterests:   p.MusicInterests,
			Photos:           p.Photos,
			Preferences: UserPreferences{
				MinAge: 18, MaxAge: 60, MaxDistanceKm: 50,
				PreferredGenders: []string{"female", "male"}, RelationshipGoals: []string{goal},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	r.users[userID] = newUser
	r.save()
	return newUser, nil
}

func (r *JsonUserRepository) Authenticate(email, password string) (*UserRecord, error) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.Authenticate", slog.String("fn", "Authenticate"), slog.String("file", JSON_FILE_PATH), slog.String("email", email))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.Authenticate", slog.String("fn", "Authenticate"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, email) {
			if u.PasswordHash == "hashed_"+password {
				return u, nil
			}
			return nil, fmt.Errorf("invalid credentials")
		}
	}
	return nil, fmt.Errorf("user not found")
}

func (r *JsonUserRepository) GetByID(id string) (*UserRecord, bool) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.GetByID", slog.String("fn", "GetByID"), slog.String("file", JSON_FILE_PATH), slog.String("id", id))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.GetByID", slog.String("fn", "GetByID"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.RLock()
	defer r.mu.RUnlock()

	u, exists := r.users[id]
	return u, exists
}

func (r *JsonUserRepository) List(status, role, city string, page, limit int) ([]*UserRecord, int) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.List", slog.String("fn", "List"), slog.String("file", JSON_FILE_PATH), slog.String("status", status), slog.String("role", role), slog.String("city", city))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.List", slog.String("fn", "List"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.RLock()
	defer r.mu.RUnlock()

	var matched []*UserRecord
	for _, u := range r.users {
		if status != "" && !strings.EqualFold(u.Status, status) {
			continue
		}
		if role != "" && !strings.EqualFold(u.Role, role) {
			continue
		}
		if city != "" && u.Profile != nil && !strings.EqualFold(u.Profile.City, city) {
			continue
		}
		matched = append(matched, u)
	}

	sort.Slice(matched, func(i, j int) bool {
		return matched[i].CreatedAt > matched[j].CreatedAt
	})

	total := len(matched)
	offset := (page - 1) * limit
	if offset >= total {
		return []*UserRecord{}, total
	}

	end := offset + limit
	if end > total {
		end = total
	}

	return matched[offset:end], total
}

func (r *JsonUserRepository) Update(id string, updates map[string]interface{}) (*UserRecord, error) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.Update", slog.String("fn", "Update"), slog.String("file", JSON_FILE_PATH), slog.String("id", id))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.Update", slog.String("fn", "Update"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.Lock()
	defer r.mu.Unlock()

	u, exists := r.users[id]
	if !exists {
		return nil, fmt.Errorf("user %s not found", id)
	}

	if statusVal, ok := updates["status"].(string); ok {
		u.Status = statusVal
	}
	if roleVal, ok := updates["role"].(string); ok {
		u.Role = roleVal
	}
	if isVerifiedVal, ok := updates["isVerified"].(bool); ok {
		u.IsVerified = isVerifiedVal
	}

	if u.Profile != nil {
		if nameVal, ok := updates["name"].(string); ok {
			u.Profile.Name = nameVal
		}
		if cityVal, ok := updates["city"].(string); ok {
			u.Profile.City = cityVal
		}
		if ageVal, ok := updates["age"].(float64); ok {
			u.Profile.Age = int(ageVal)
		}
		u.Profile.UpdatedAt = time.Now().Format(time.RFC3339)
	}

	u.UpdatedAt = time.Now().Format(time.RFC3339)
	r.save()
	return u, nil
}

func (r *JsonUserRepository) Delete(id string) bool {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] JsonUserRepository.Delete", slog.String("fn", "Delete"), slog.String("file", JSON_FILE_PATH), slog.String("id", id))
	defer func() {
		slog.Info("👈 [Fn EXIT] JsonUserRepository.Delete", slog.String("fn", "Delete"), slog.String("file", JSON_FILE_PATH), slog.Duration("duration", time.Since(start)))
	}()

	r.mu.Lock()
	defer r.mu.Unlock()

	u, exists := r.users[id]
	if !exists {
		return false
	}
	u.Status = "deactivated"
	u.UpdatedAt = time.Now().Format(time.RFC3339)
	r.save()
	return true
}

func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
