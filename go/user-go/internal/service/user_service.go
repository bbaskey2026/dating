package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"math"
	"strings"
	"time"

	"github.com/topolgira/user-go/domain"
)

// UserServiceImpl is the business logic implementation for User management.
// It receives all dependencies via constructor injection.
type UserServiceImpl struct {
	repo          domain.UserRepository
	hasher        domain.PasswordHasher
	tokenProvider domain.TokenProvider
}

// NewUserService constructs a new UserService with all injected dependencies.
func NewUserService(
	repo domain.UserRepository,
	hasher domain.PasswordHasher,
	tokenProvider domain.TokenProvider,
) domain.UserService {
	return &UserServiceImpl{
		repo:          repo,
		hasher:        hasher,
		tokenProvider: tokenProvider,
	}
}

func (s *UserServiceImpl) Register(ctx context.Context, req domain.RegisterRequest) (*domain.User, error) {
	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		return nil, fmt.Errorf("%w: email and password are required", domain.ErrInvalidInput)
	}

	exists, err := s.repo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrEmailAlreadyExists
	}

	hashedPassword, err := s.hasher.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	userID := generateUUID()
	profileID := generateUUID()
	now := time.Now().UTC().Format(time.RFC3339)

	name := req.Name
	if name == "" {
		parts := strings.Split(req.Email, "@")
		name = parts[0]
	}

	age := req.Age
	if age <= 0 {
		age = 25
	}

	gender := req.Gender
	if gender == "" {
		gender = "other"
	}

	city := req.City
	if city == "" {
		city = "Ranchi"
	}

	relationshipGoal := req.RelationshipGoal
	if relationshipGoal == "" {
		relationshipGoal = "marriage"
	}

	user := &domain.User{
		ID:           userID,
		Email:        strings.ToLower(strings.TrimSpace(req.Email)),
		PasswordHash: hashedPassword,
		PhoneNumber:  req.PhoneNumber,
		Role:         domain.RoleUser,
		Status:       domain.StatusActive,
		IsVerified:   false,
		Profile: &domain.UserProfile{
			ID:               profileID,
			UserID:           userID,
			Name:             name,
			Age:              age,
			Gender:           gender,
			City:             city,
			Location:         domain.Location{Latitude: 23.3441, Longitude: 85.3096, City: city, Country: "India"},
			Education:        req.Education,
			Profession:       req.Profession,
			RelationshipGoal: relationshipGoal,
			Bio:              req.Bio,
			Interests:        req.Interests,
			Languages:        req.Languages,
			Hobbies:          req.Hobbies,
			FoodPreferences:  req.FoodPreferences,
			MusicInterests:   req.MusicInterests,
			Photos:           req.Photos,
			Preferences: domain.UserPreferences{
				MinAge:            18,
				MaxAge:            60,
				MaxDistanceKm:     50,
				PreferredGenders:  []string{"female", "male"},
				RelationshipGoals: []string{relationshipGoal},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	slog.Info("✅ User successfully registered", slog.String("userId", user.ID), slog.String("email", user.Email))
	return user, nil
}

func (s *UserServiceImpl) Authenticate(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		return nil, fmt.Errorf("%w: email and password are required", domain.ErrInvalidInput)
	}

	user, err := s.repo.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	if user.Status == domain.StatusDeactivated || user.Status == domain.StatusSuspended {
		return nil, domain.ErrUserDeactivated
	}

	if !s.hasher.ComparePassword(user.PasswordHash, req.Password) {
		return nil, domain.ErrInvalidCredentials
	}

	token, err := s.tokenProvider.GenerateToken(domain.TokenClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	slog.Info("🔓 User authenticated successfully", slog.String("userId", user.ID), slog.String("email", user.Email))
	return &domain.AuthResponse{
		User:  user,
		Token: token,
	}, nil
}

func (s *UserServiceImpl) GetByID(ctx context.Context, id string) (*domain.User, error) {
	if id == "" {
		return nil, domain.ErrInvalidInput
	}
	return s.repo.GetByID(ctx, id)
}

func (s *UserServiceImpl) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if email == "" {
		return nil, domain.ErrInvalidInput
	}
	return s.repo.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
}

func (s *UserServiceImpl) UpdateProfile(ctx context.Context, id string, req domain.UpdateProfileRequest) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC().Format(time.RFC3339)

	if req.PhoneNumber != nil {
		user.PhoneNumber = *req.PhoneNumber
	}
	if req.IsVerified != nil {
		user.IsVerified = *req.IsVerified
	}

	if user.Profile == nil {
		user.Profile = &domain.UserProfile{
			ID:        generateUUID(),
			UserID:    user.ID,
			CreatedAt: now,
		}
	}

	p := user.Profile
	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Age != nil {
		p.Age = *req.Age
	}
	if req.Gender != nil {
		p.Gender = *req.Gender
	}
	if req.City != nil {
		p.City = *req.City
	}
	if req.Bio != nil {
		p.Bio = *req.Bio
	}
	if req.Education != nil {
		p.Education = *req.Education
	}
	if req.Profession != nil {
		p.Profession = *req.Profession
	}
	if req.RelationshipGoal != nil {
		p.RelationshipGoal = *req.RelationshipGoal
	}
	if req.Interests != nil {
		p.Interests = req.Interests
	}
	if req.Languages != nil {
		p.Languages = req.Languages
	}
	if req.Hobbies != nil {
		p.Hobbies = req.Hobbies
	}
	if req.FoodPreferences != nil {
		p.FoodPreferences = req.FoodPreferences
	}
	if req.MusicInterests != nil {
		p.MusicInterests = req.MusicInterests
	}
	if req.Photos != nil {
		p.Photos = req.Photos
	}
	if req.Location != nil {
		p.Location = *req.Location
	}
	if req.Preferences != nil {
		p.Preferences = *req.Preferences
	}

	p.UpdatedAt = now
	user.UpdatedAt = now

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	slog.Info("📝 User profile updated", slog.String("userId", user.ID))
	return user, nil
}

func (s *UserServiceImpl) ChangePassword(ctx context.Context, id string, req domain.ChangePasswordRequest) error {
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return fmt.Errorf("%w: current and new passwords are required", domain.ErrInvalidInput)
	}

	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if !s.hasher.ComparePassword(user.PasswordHash, req.CurrentPassword) {
		return domain.ErrPasswordMismatch
	}

	newHashed, err := s.hasher.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	user.PasswordHash = newHashed
	user.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	return s.repo.Update(ctx, user)
}

func (s *UserServiceImpl) UpdateStatus(ctx context.Context, id string, req domain.UpdateStatusRequest) (*domain.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Status != "" {
		user.Status = req.Status
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	user.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserServiceImpl) ListUsers(ctx context.Context, filter domain.UserQueryFilter) (*domain.PaginatedUsersResponse, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 20
	}

	users, total, err := s.repo.List(ctx, filter)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(filter.Limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &domain.PaginatedUsersResponse{
		Users:      users,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

func (s *UserServiceImpl) DeleteUser(ctx context.Context, id string) error {
	if id == "" {
		return domain.ErrInvalidInput
	}
	return s.repo.Delete(ctx, id)
}

func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
