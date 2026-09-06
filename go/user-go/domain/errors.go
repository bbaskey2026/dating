package domain

import "errors"

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrEmailAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrUnauthorized        = errors.New("unauthorized")
	ErrForbidden           = errors.New("forbidden")
	ErrInvalidInput        = errors.New("invalid request input")
	ErrUserDeactivated     = errors.New("user account is deactivated")
	ErrPasswordMismatch    = errors.New("current password is incorrect")
	ErrInternalServerError = errors.New("internal server error")
)
