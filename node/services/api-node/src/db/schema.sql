-- PostgreSQL Database Schema for Topolgira

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID PRIMARY KEY,
    phone_or_email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    education VARCHAR(100),
    profession VARCHAR(100),
    relationship_goal VARCHAR(50) NOT NULL,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    food_preferences TEXT[] DEFAULT '{}',
    music_interests TEXT[] DEFAULT '{}',
    min_age_pref INT DEFAULT 18,
    max_age_pref INT DEFAULT 60,
    max_distance_km INT DEFAULT 50,
    preferred_genders TEXT[] DEFAULT '{}',
    relationship_goals_pref TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    width INT,
    height INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_user_id, to_user_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY,
    user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_a_id, user_b_id)
);

CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY,
    blocker_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY,
    reporter_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_a_id, user_b_id)
);

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'message',
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'SENT',
    sent_timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(sent_timestamp DESC);
