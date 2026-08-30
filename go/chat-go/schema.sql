-- Topolgira Chat Microservice Database Schema
-- Compatible with PostgreSQL 13+

-- 1. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_a_id UUID NOT NULL,
    user_b_id UUID NOT NULL,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_pair UNIQUE (user_a_id, user_b_id)
);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'message',
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'SENT',
    sent_timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CHAT READ RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS chat_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    last_read_message_id UUID,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_chat_user_read UNIQUE (chat_id, user_id)
);

-- INDEXES FOR FAST CHAT QUERYING & SORTING
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(sent_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_a ON chat_conversations(user_a_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_b ON chat_conversations(user_b_id);
