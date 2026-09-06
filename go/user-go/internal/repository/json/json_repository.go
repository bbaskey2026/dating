package json

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/topolgira/user-go/domain"
)

type userJSONRecord struct {
	ID           string              `json:"id"`
	Email        string              `json:"email"`
	PasswordHash string              `json:"passwordHash"`
	PhoneNumber  string              `json:"phoneNumber,omitempty"`
	Role         domain.UserRole     `json:"role"`
	Status       domain.UserStatus   `json:"status"`
	IsVerified   bool                `json:"isVerified"`
	Profile      *domain.UserProfile `json:"profile,omitempty"`
	CreatedAt    string              `json:"createdAt"`
	UpdatedAt    string              `json:"updatedAt"`
}

type JsonUserRepository struct {
	mu       sync.RWMutex
	filePath string
	users    map[string]*domain.User
}

func NewJsonUserRepository(filePath string) domain.UserRepository {
	if filePath == "" {
		filePath = "users.json"
	}
	repo := &JsonUserRepository{
		filePath: filePath,
		users:    make(map[string]*domain.User),
	}
	repo.load()
	return repo
}

func (r *JsonUserRepository) load() {
	data, err := os.ReadFile(r.filePath)
	if err != nil {
		return
	}

	var list []*userJSONRecord
	if err := json.Unmarshal(data, &list); err != nil {
		return
	}

	for _, rec := range list {
		r.users[rec.ID] = &domain.User{
			ID:           rec.ID,
			Email:        rec.Email,
			PasswordHash: rec.PasswordHash,
			PhoneNumber:  rec.PhoneNumber,
			Role:         rec.Role,
			Status:       rec.Status,
			IsVerified:   rec.IsVerified,
			Profile:      rec.Profile,
			CreatedAt:    rec.CreatedAt,
			UpdatedAt:    rec.UpdatedAt,
		}
	}
}

func (r *JsonUserRepository) save() {
	var list []*userJSONRecord
	for _, u := range r.users {
		list = append(list, &userJSONRecord{
			ID:           u.ID,
			Email:        u.Email,
			PasswordHash: u.PasswordHash,
			PhoneNumber:  u.PhoneNumber,
			Role:         u.Role,
			Status:       u.Status,
			IsVerified:   u.IsVerified,
			Profile:      u.Profile,
			CreatedAt:    u.CreatedAt,
			UpdatedAt:    u.UpdatedAt,
		})
	}

	data, err := json.MarshalIndent(list, "", "  ")
	if err == nil {
		_ = os.MkdirAll(filepath.Dir(r.filePath), 0755)
		_ = os.WriteFile(r.filePath, data, 0644)
	}
}

func (r *JsonUserRepository) Create(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, user.Email) {
			return domain.ErrEmailAlreadyExists
		}
	}

	r.users[user.ID] = user
	r.save()
	return nil
}

func (r *JsonUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	u, exists := r.users[id]
	if !exists {
		return nil, domain.ErrUserNotFound
	}
	return u, nil
}

func (r *JsonUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, email) {
			return u, nil
		}
	}
	return nil, domain.ErrUserNotFound
}

func (r *JsonUserRepository) Update(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[user.ID]; !exists {
		return domain.ErrUserNotFound
	}
	r.users[user.ID] = user
	r.save()
	return nil
}

func (r *JsonUserRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	u, exists := r.users[id]
	if !exists {
		return domain.ErrUserNotFound
	}
	u.Status = domain.StatusDeactivated
	r.save()
	return nil
}

func (r *JsonUserRepository) List(ctx context.Context, filter domain.UserQueryFilter) ([]*domain.User, int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var matched []*domain.User
	for _, u := range r.users {
		if filter.Status != "" && !strings.EqualFold(string(u.Status), filter.Status) {
			continue
		}
		if filter.Role != "" && !strings.EqualFold(string(u.Role), filter.Role) {
			continue
		}
		if u.Profile != nil {
			if filter.City != "" && !strings.EqualFold(u.Profile.City, filter.City) {
				continue
			}
			if filter.Gender != "" && !strings.EqualFold(u.Profile.Gender, filter.Gender) {
				continue
			}
			if filter.MinAge > 0 && u.Profile.Age < filter.MinAge {
				continue
			}
			if filter.MaxAge > 0 && u.Profile.Age > filter.MaxAge {
				continue
			}
			if filter.Search != "" {
				term := strings.ToLower(filter.Search)
				nameMatch := strings.Contains(strings.ToLower(u.Profile.Name), term)
				emailMatch := strings.Contains(strings.ToLower(u.Email), term)
				bioMatch := strings.Contains(strings.ToLower(u.Profile.Bio), term)
				if !nameMatch && !emailMatch && !bioMatch {
					continue
				}
			}
		} else if filter.Search != "" && !strings.Contains(strings.ToLower(u.Email), strings.ToLower(filter.Search)) {
			continue
		}

		matched = append(matched, u)
	}

	sort.Slice(matched, func(i, j int) bool {
		return matched[i].CreatedAt > matched[j].CreatedAt
	})

	total := len(matched)
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}

	offset := (filter.Page - 1) * filter.Limit
	if offset >= total {
		return []*domain.User{}, total, nil
	}

	end := offset + filter.Limit
	if end > total {
		end = total
	}

	return matched[offset:end], total, nil
}

func (r *JsonUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, email) {
			return true, nil
		}
	}
	return false, nil
}
