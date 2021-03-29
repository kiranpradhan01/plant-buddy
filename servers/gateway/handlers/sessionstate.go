package handlers

import (
	"time"

	"final-project/servers/gateway/models/users"
)

// SessionState tracks the time at which the session began and the authenticated user who started the session
type SessionState struct {
	User         users.User `json:"user"`
	SessionStart time.Time  `json:"sessionStart"`
}
