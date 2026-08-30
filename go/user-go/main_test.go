package main

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/topolgira/user-go/repository"
)

func TestUserRepositoryDependencyInjection(t *testing.T) {
	testFile := fmt.Sprintf("test_users_%d.json", time.Now().UnixNano())
	defer os.Remove(testFile)

	// Test 1: JSON File Repository Injection
	jsonRepo := repository.NewUserRepository("json", testFile)
	testRepoSuite(t, jsonRepo, "JSON")

	// Test 2: Postgres Repository Injection
	postgresRepo := repository.NewUserRepository("postgres", "postgres://topolgira_user:topolgira_password@localhost:5432/topolgira")
	testRepoSuite(t, postgresRepo, "POSTGRES")
}

func testRepoSuite(t *testing.T, repo repository.UserRepository, driverName string) {
	t.Logf("Testing repository suite for driver: %s", driverName)

	uniqueEmail := fmt.Sprintf("di_user_%s_%d@example.com", driverName, time.Now().UnixNano())

	payload := repository.RegisterUserPayload{
		Email:            uniqueEmail,
		Password:         "secret123",
		PhoneNumber:      "+919876543210",
		Name:             "DI Test User",
		Age:              25,
		Gender:           "female",
		City:             "Ranchi",
		Bio:              "Testing DI",
		RelationshipGoal: "marriage",
		Interests:        []string{"Music", "Travel"},
	}

	// 1. Create User
	user, err := repo.Create(payload)
	if err != nil {
		t.Fatalf("[%s] Failed to create user: %v", driverName, err)
	}

	// 2. Authenticate User
	authOk, errAuth := repo.Authenticate(uniqueEmail, "secret123")
	if errAuth != nil || authOk.ID != user.ID {
		t.Errorf("[%s] Expected authentication to succeed, got error: %v", driverName, errAuth)
	}

	// 3. Update User
	updated, errUp := repo.Update(user.ID, map[string]interface{}{
		"city": "Dhanbad",
		"age":  float64(28),
	})
	if errUp != nil || updated.Profile.City != "Dhanbad" || updated.Profile.Age != 28 {
		t.Errorf("[%s] Expected city 'Dhanbad' and age 28, got city '%s' age %d", driverName, updated.Profile.City, updated.Profile.Age)
	}

	// 4. Get User By ID
	fetched, exists := repo.GetByID(user.ID)
	if !exists || fetched.ID != user.ID {
		t.Errorf("[%s] Expected GetByID to find user %s", driverName, user.ID)
	}

	// 5. Delete User
	if !repo.Delete(user.ID) {
		t.Errorf("[%s] Expected Delete to succeed", driverName)
	}
}
