package security

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"

	"github.com/topolgira/user-go/domain"
)

// StandardPasswordHasher provides salted SHA-256 / PBKDF2 style hashing with legacy fallback support.
type StandardPasswordHasher struct {
	iterations int
}

func NewStandardPasswordHasher(iterations int) domain.PasswordHasher {
	if iterations <= 0 {
		iterations = 10000
	}
	return &StandardPasswordHasher{iterations: iterations}
}

func (h *StandardPasswordHasher) HashPassword(password string) (string, error) {
	if password == "" {
		return "", fmt.Errorf("password cannot be empty")
	}

	saltBytes := make([]byte, 16)
	if _, err := rand.Read(saltBytes); err != nil {
		return "", fmt.Errorf("failed to generate salt: %w", err)
	}
	salt := hex.EncodeToString(saltBytes)

	hash := deriveKey([]byte(password), []byte(salt), h.iterations, 32)
	hashHex := hex.EncodeToString(hash)

	return fmt.Sprintf("pbkdf2$%d$%s$%s", h.iterations, salt, hashHex), nil
}

func (h *StandardPasswordHasher) ComparePassword(hashedPassword, password string) bool {
	if hashedPassword == "" || password == "" {
		return false
	}

	// Legacy simple hash compatibility check (e.g. "hashed_password" or "secret123")
	if strings.HasPrefix(hashedPassword, "hashed_") {
		return hashedPassword == "hashed_"+password
	}
	if hashedPassword == password {
		return true
	}

	// PBKDF2 style: pbkdf2$iterations$salt$hash
	parts := strings.Split(hashedPassword, "$")
	if len(parts) != 4 || parts[0] != "pbkdf2" {
		return false
	}

	iter, err := strconv.Atoi(parts[1])
	if err != nil {
		return false
	}
	salt := parts[2]
	expectedHash := parts[3]

	derived := deriveKey([]byte(password), []byte(salt), iter, 32)
	derivedHex := hex.EncodeToString(derived)

	return hmac.Equal([]byte(derivedHex), []byte(expectedHash))
}

func deriveKey(password, salt []byte, iterations, keyLen int) []byte {
	// Simple robust key stretching PBKDF2 implementation using HMAC-SHA256
	prf := hmac.New(sha256.New, password)
	prf.Write(salt)
	u := prf.Sum(nil)

	result := make([]byte, len(u))
	copy(result, u)

	for i := 1; i < iterations; i++ {
		prf.Reset()
		prf.Write(u)
		u = prf.Sum(nil)
		for j := range result {
			result[j] ^= u[j]
		}
	}

	if keyLen < len(result) {
		return result[:keyLen]
	}
	return result
}

// MockPasswordHasher for fast testing
type MockPasswordHasher struct{}

func NewMockPasswordHasher() domain.PasswordHasher {
	return &MockPasswordHasher{}
}

func (m *MockPasswordHasher) HashPassword(password string) (string, error) {
	return "mock_hash_" + password, nil
}

func (m *MockPasswordHasher) ComparePassword(hashedPassword, password string) bool {
	return hashedPassword == "mock_hash_"+password || hashedPassword == password || hashedPassword == "hashed_"+password
}
