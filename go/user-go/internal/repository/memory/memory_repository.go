package memory

import (
	"context"
	"sort"
	"strings"
	"sync"

	"github.com/topolgira/user-go/domain"
)

// MemoryUserRepository is an in-memory thread-safe implementation of domain.UserRepository.
type MemoryUserRepository struct {
	mu    sync.RWMutex
	users map[string]*domain.User
}

func NewMemoryUserRepository() domain.UserRepository {
	return &MemoryUserRepository{
		users: make(map[string]*domain.User),
	}
}

func (r *MemoryUserRepository) Create(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, user.Email) {
			return domain.ErrEmailAlreadyExists
		}
	}

	r.users[user.ID] = user
	return nil
}

func (r *MemoryUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, exists := r.users[id]
	if !exists {
		return nil, domain.ErrUserNotFound
	}
	return user, nil
}

func (r *MemoryUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, email) {
			return u, nil
		}
	}
	return nil, domain.ErrUserNotFound
}

func (r *MemoryUserRepository) Update(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[user.ID]; !exists {
		return domain.ErrUserNotFound
	}
	r.users[user.ID] = user
	return nil
}

func (r *MemoryUserRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	user, exists := r.users[id]
	if !exists {
		return domain.ErrUserNotFound
	}
	user.Status = domain.StatusDeactivated
	return nil
}

func (r *MemoryUserRepository) List(ctx context.Context, filter domain.UserQueryFilter) ([]*domain.User, int, error) {
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

func (r *MemoryUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.users {
		if strings.EqualFold(u.Email, email) {
			return true, nil
		}
	}
	return false, nil
}
