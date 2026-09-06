package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/topolgira/user-go/domain"
)

type JWTTokenProvider struct {
	secretKey     []byte
	expiresInTime time.Duration
}

func NewJWTTokenProvider(secretKey string, expirationHours int) domain.TokenProvider {
	if secretKey == "" {
		secretKey = "topolgira_default_secret_jwt"
	}
	if expirationHours <= 0 {
		expirationHours = 72
	}
	return &JWTTokenProvider{
		secretKey:     []byte(secretKey),
		expiresInTime: time.Duration(expirationHours) * time.Hour,
	}
}

type jwtHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

type jwtPayload struct {
	UserID    string          `json:"userId"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	IssuedAt  int64           `json:"iat"`
	ExpiresAt int64           `json:"exp"`
}

func (p *JWTTokenProvider) GenerateToken(claims domain.TokenClaims) (string, error) {
	now := time.Now()
	header := jwtHeader{Alg: "HS256", Typ: "JWT"}
	payload := jwtPayload{
		UserID:    claims.UserID,
		Email:     claims.Email,
		Role:      claims.Role,
		IssuedAt:  now.Unix(),
		ExpiresAt: now.Add(p.expiresInTime).Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	headerB64 := base64.RawURLEncoding.EncodeToString(headerJSON)
	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadJSON)

	unsignedToken := fmt.Sprintf("%s.%s", headerB64, payloadB64)
	signature := computeHMACSHA256([]byte(unsignedToken), p.secretKey)
	signatureB64 := base64.RawURLEncoding.EncodeToString(signature)

	return fmt.Sprintf("%s.%s", unsignedToken, signatureB64), nil
}

func (p *JWTTokenProvider) ValidateToken(tokenString string) (*domain.TokenClaims, error) {
	// Support legacy simulated tokens (e.g. "go_jwt_token_userId")
	if strings.HasPrefix(tokenString, "go_jwt_token_") {
		uid := strings.TrimPrefix(tokenString, "go_jwt_token_")
		return &domain.TokenClaims{
			UserID: uid,
			Email:  uid + "@example.com",
			Role:   domain.RoleUser,
		}, nil
	}

	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	unsignedToken := fmt.Sprintf("%s.%s", parts[0], parts[1])
	expectedSig := computeHMACSHA256([]byte(unsignedToken), p.secretKey)
	actualSig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(expectedSig, actualSig) {
		return nil, domain.ErrUnauthorized
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("invalid token payload: %w", err)
	}

	var payload jwtPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claims: %w", err)
	}

	if time.Now().Unix() > payload.ExpiresAt {
		return nil, fmt.Errorf("token has expired")
	}

	return &domain.TokenClaims{
		UserID: payload.UserID,
		Email:  payload.Email,
		Role:   payload.Role,
	}, nil
}

func computeHMACSHA256(message, secret []byte) []byte {
	h := hmac.New(sha256.New, secret)
	h.Write(message)
	return h.Sum(nil)
}

// MockTokenProvider for unit tests
type MockTokenProvider struct{}

func NewMockTokenProvider() domain.TokenProvider {
	return &MockTokenProvider{}
}

func (m *MockTokenProvider) GenerateToken(claims domain.TokenClaims) (string, error) {
	return fmt.Sprintf("mock_jwt_%s_%s", claims.UserID, claims.Role), nil
}

func (m *MockTokenProvider) ValidateToken(tokenString string) (*domain.TokenClaims, error) {
	if strings.HasPrefix(tokenString, "mock_jwt_") {
		parts := strings.Split(tokenString, "_")
		if len(parts) >= 4 {
			return &domain.TokenClaims{
				UserID: parts[2],
				Role:   domain.UserRole(parts[3]),
			}, nil
		}
	}
	return &domain.TokenClaims{
		UserID: "test-user-id",
		Email:  "test@example.com",
		Role:   domain.RoleUser,
	}, nil
}
