# Topolgira Multi-Service Dating App API Specifications

## Service Ports Overview

| Service Name | Technology | URL Base | Port |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | React + Vite | `http://localhost:5173` | 5173 |
| **API Gateway Monolith** | Node.js / Express | `http://localhost:4000` | 4000 |
| **User Management Service** | Go / `slog` | `http://localhost:8081` | 8081 |
| **Matching Engine** | Go / Jaccard | `http://localhost:8080` | 8080 |
| **Real-Time Chat Gateway** | Go / WebSocket | `ws://localhost:9000/ws` | 9000 |

---

## 1. Node.js API Gateway Services (`http://localhost:4000`)

### Authentication Endpoints

#### `POST /auth/register`
Registers a new user profile. Internally forwards registration payload to Go User Management Service (`http://localhost:8081/api/v1/users/register`).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Bhima Baskey",
  "age": 25,
  "gender": "male",
  "city": "Ranchi",
  "education": "B.Tech Computer Science",
  "profession": "Software Engineer",
  "relationshipGoal": "marriage",
  "bio": "Passionate about software architecture, travel, and music.",
  "interests": ["Music", "Travel", "Cricket"],
  "languages": ["Hindi", "English", "Santhali"],
  "hobbies": ["Hiking", "Guitar"],
  "foodPreferences": ["Spicy", "Street Food"],
  "musicInterests": ["Bollywood", "Rock"],
  "photos": ["https://example.com/photo.jpg"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration complete via Node.js Gateway & Go User Service",
  "data": {
    "user": {
      "id": "uuid-v4-string",
      "email": "user@example.com",
      "role": "user",
      "isVerified": false,
      "createdAt": "2026-08-30T14:15:00Z"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "goUserSynced": true
  }
}
```

#### `POST /auth/login`
Authenticates an existing user.

#### `POST /auth/logout`
Revokes user refresh token and terminates session.

---

### User Dashboard Endpoint

#### `GET /dashboard/me`
Requires `Authorization: Bearer <accessToken>`. Returns user profile metrics, mutual matches count, and microservices system health.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User Dashboard metrics fetched successfully",
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "role": "user" },
    "profile": { "name": "Bhima Baskey", "city": "Ranchi", "age": 25 },
    "metrics": {
      "matchesCount": 3,
      "likesGivenCount": 6,
      "likesReceivedCount": 12,
      "profileCompleteness": 100,
      "averageMatchScore": 92
    },
    "servicesHealth": {
      "gatewayNode": "healthy (Port 4000)",
      "userGoService": "healthy (Port 8081)",
      "matchingGoEngine": "healthy (Port 8080)",
      "chatGoGateway": "healthy (Port 9000)"
    }
  }
}
```

---

## 2. Go User Management Microservice (`http://localhost:8081`)

- `POST /api/v1/users/register`: Direct user registration.
- `POST /api/v1/users/login`: Authenticate user credentials.
- `GET /api/v1/users`: List users with pagination.
- `GET /api/v1/users/:id`: Get user details by ID.

---

## 3. Go Matching Engine Microservice (`http://localhost:8080`)

- `POST /api/v1/recommendations`: Calculates Jaccard set similarity across 5 preference vectors (Interests, Languages, Hobbies, Food, Music) and Haversine geo-distance.

---

## 4. Go Real-Time WebSocket Chat Gateway (`ws://localhost:9000/ws`)

- `ws://localhost:9000/ws`: Connects live sockets for real-time instant message routing.
