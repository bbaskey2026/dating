package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port         string
	DBDriver     string
	DatabaseURL  string
	JWTSecret    string
	JWTExpiresIn int // in hours
	BcryptCost   int
	Environment  string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	driver := os.Getenv("DB_DRIVER")
	if driver == "" {
		driver = "postgres"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		if driver == "postgres" {
			dbURL = "postgres://postgres:postgres@localhost:5432/topolgira"
		} else {
			dbURL = "users.json"
		}
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "topolgira_super_secret_jwt_key_2026_go_di"
	}

	jwtExpiresIn, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_IN_HOURS"))
	if err != nil || jwtExpiresIn <= 0 {
		jwtExpiresIn = 72 // 3 days default
	}

	bcryptCost, err := strconv.Atoi(os.Getenv("BCRYPT_COST"))
	if err != nil || bcryptCost <= 0 {
		bcryptCost = 10
	}

	env := os.Getenv("GO_ENV")
	if env == "" {
		env = os.Getenv("NODE_ENV")
		if env == "" {
			env = "development"
		}
	}

	return &Config{
		Port:         port,
		DBDriver:     driver,
		DatabaseURL:  dbURL,
		JWTSecret:    jwtSecret,
		JWTExpiresIn: jwtExpiresIn,
		BcryptCost:   bcryptCost,
		Environment:  env,
	}
}
