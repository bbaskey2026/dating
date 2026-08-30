package repository

type ChatMessagePayload struct {
	Type       string `json:"type"`
	ChatID     string `json:"chatId,omitempty"`
	SenderID   string `json:"senderId,omitempty"`
	ReceiverID string `json:"receiverId,omitempty"`
	Content    string `json:"content,omitempty"`
	Timestamp  int64  `json:"timestamp,omitempty"`
	Status     string `json:"status,omitempty"`
}

type MessageRepository interface {
	SaveMessage(msg ChatMessagePayload) error
	GetChatHistory(chatID string, limit int) ([]ChatMessagePayload, error)
}
