package repository

type UserRepository interface {
	Create(payload RegisterUserPayload) (*UserRecord, error)
	Authenticate(email, password string) (*UserRecord, error)
	GetByID(id string) (*UserRecord, bool)
	List(status, role, city string, page, limit int) ([]*UserRecord, int)
	Update(id string, updates map[string]interface{}) (*UserRecord, error)
	Delete(id string) bool
}
