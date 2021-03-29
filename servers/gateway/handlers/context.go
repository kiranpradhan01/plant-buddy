package handlers

import (
	"final-project/servers/gateway/models/users"
	"final-project/servers/gateway/sessions"
)

//TODO: define a handler context struct that will be a receiver on any of your HTTP
//handler functions that need access to globals, such as the key used for signing
//and verifying SessionIDs, the session store and the user store

// HandlerContext tracks the key used for signing in, the session store, and the user store
type HandlerContext struct {
	Key          string
	SessionStore sessions.Store
	UserStore    users.Store
}

// NewHandlerContext constructs a new HandlerContext, ensuring that the dependencies are valid values
func NewHandlerContext(key string, seshStore sessions.Store, usersStore users.Store) *HandlerContext {
	if key == "" {
		return nil
	}
	if seshStore == nil {
		return nil
	}
	if usersStore == nil {
		return nil
	}
	return &HandlerContext{key, seshStore, usersStore}
}
