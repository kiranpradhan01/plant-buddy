package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"time"

	"final-project/servers/gateway/models/users"
	"final-project/servers/gateway/sessions"
)

const AuthorizationHeader = "Authorization"
const ContentTypeHeader = "Content-Type"
const ContentTypeApplicationJSON = "application/json"

// UsersHandler handles requests for the "users" resource. Only accepts POST requests.
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		if r.Header.Get("Content-Type") != ContentTypeApplicationJSON {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}

		nu := &users.NewUser{}
		if err := json.NewDecoder(r.Body).Decode(nu); err != nil {
			http.Error(w, fmt.Sprintf("Error decoding JSON: %v", err),
				http.StatusBadRequest)
			return
		}

		// validate data and create a new user account in the database
		if err := nu.Validate(); err != nil {
			http.Error(w, fmt.Sprintf("Invalid data in new user credentials: %v", err), http.StatusBadRequest)
			return
		}
		// newUser is of type *User now
		newUser, err := nu.ToUser()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		user, err := ctx.UserStore.Insert(newUser)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting new user: %v", err), http.StatusBadRequest)
			return
		}

		// start and store new session
		sessionState := &SessionState{*user, time.Now()}
		_, err = sessions.BeginSession(ctx.Key, ctx.SessionStore, sessionState, w)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create session: %v", err), http.StatusInternalServerError)
			return
		}

		// respond to client
		w.Header().Add(ContentTypeHeader, ContentTypeApplicationJSON)
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(user); err != nil {
			http.Error(w, fmt.Sprintf("Error encoding JSON: %v", err),
				http.StatusInternalServerError)
			return
		}
		fmt.Printf("A user was just created with email: %s\n", user.Email)
	} else {
		http.Error(w, "Method type not supported", http.StatusMethodNotAllowed)
		return
	}
}

// SpecificUserHandler handles requests for a specific user in resource path /v1/users/{UserID}. Only accepts GET and PATCH requests
func (ctx *HandlerContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request) {
	// current user must be authenticated to call this handler
	currSeshState := &SessionState{} //initiate session state
	_, err := sessions.GetState(r, ctx.Key, ctx.SessionStore, currSeshState)
	if err != nil {
		http.Error(w, fmt.Sprintf("User is not authorized: %v", err),
			http.StatusUnauthorized)
		return
	}

	if r.Method == http.MethodGet {
		idPath := path.Base(r.URL.Path)
		var id int
		if idPath != "me" {
			// Cases: v1/users/4, v1/users/somethingrandom
			var err error
			id, err = strconv.Atoi(idPath)
			if err != nil {
				http.Error(w, fmt.Sprintf("ID was not provided in valid way: %v", err), http.StatusBadRequest)
				return
			}
		} else {
			// Cases: v1/users/me
			// get numeric ID from currently-authenticated user
			id = int(currSeshState.User.ID)
		}
		// get users.User object from ID
		user, err := ctx.UserStore.GetByID(int64(id))
		if err != nil {
			http.Error(w, fmt.Sprintf("User with given ID not found: %v", err), http.StatusNotFound)
			return
		}

		// respond to client
		w.Header().Add(ContentTypeHeader, ContentTypeApplicationJSON)
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(user); err != nil {
			http.Error(w, fmt.Sprintf("Error encoding JSON: %v", err),
				http.StatusInternalServerError)
			return
		}
		fmt.Printf("User information was just given for userID %d\n", id)

	} else if r.Method == http.MethodPatch {
		if r.Header.Get(ContentTypeHeader) != ContentTypeApplicationJSON {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}

		idPath := path.Base(r.URL.Path)
		var id int
		if idPath != "me" {
			// Cases: v1/users/4, v1/users/somethingrandom
			var err error
			id, err = strconv.Atoi(idPath)
			if err != nil {
				http.Error(w, fmt.Sprintf("ID was not provided in valid way: %v", err), http.StatusBadRequest)
				return
			}
			// check if ID given matches the currently-authenticated user
			if id != int(currSeshState.User.ID) {
				http.Error(w, fmt.Sprintf("ID provided is not valid: %v", err), http.StatusForbidden)
				return
			}
		} else {
			// Cases: v1/users/me
			// get numeric ID from currently-authenticated user
			id = int(currSeshState.User.ID)
		}

		updates := &users.Updates{}
		if err := json.NewDecoder(r.Body).Decode(updates); err != nil {
			http.Error(w, fmt.Sprintf("Error decoding JSON: %v", err), http.StatusBadRequest)
			return
		}
		// update the user's credentials in the database
		user, err := ctx.UserStore.Update(int64(id), updates)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating credentials"), http.StatusInternalServerError)
			return
		}

		// respond to the client
		w.Header().Add(ContentTypeHeader, ContentTypeApplicationJSON)
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(user); err != nil {
			http.Error(w, fmt.Sprintf("Error encoding JSON: %v", err),
				http.StatusInternalServerError)
			return
		}
		fmt.Printf("User credentials were just updated. User email: %s\n", user.Email)

	} else {
		http.Error(w, "Method type not supported", http.StatusMethodNotAllowed)
		return
	}
}

// SessionsHandler handles requests for the "sessions" resource, and allows clients to begin a new session using an existing user's credentials. Only allows POST requests
func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		if r.Header.Get("Content-Type") != ContentTypeApplicationJSON {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}

		uc := &users.Credentials{}
		if err := json.NewDecoder(r.Body).Decode(uc); err != nil {
			http.Error(w, fmt.Sprintf("Error fetching user credentials: %v", err),
				http.StatusInternalServerError)
			return
		}

		// authenticate user by email
		userLoggingIn, err := ctx.UserStore.GetByEmail(uc.Email)
		if err != nil {
			// increase time ?
			http.Error(w, "Invalid Credentials - No user", http.StatusUnauthorized)
			return
		}

		// authenticate user by password
		if userLoggingIn.Authenticate(uc.Password) != nil {
			http.Error(w, "Invalid Credentials - Wrong password", http.StatusUnauthorized)
			return
		}

		// new session
		sesh := &SessionState{*userLoggingIn, time.Now()}
		_, err = sessions.BeginSession(ctx.Key, ctx.SessionStore, sesh, w)
		if err != nil {
			http.Error(w, "Invalid Credentials - No session", http.StatusUnauthorized)
			return
		}

		// insert response
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		userJSON, err := json.Marshal(userLoggingIn)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating user"), http.StatusInternalServerError)
		}
		w.Write(userJSON)

	} else {
		http.Error(w, "Method type not supported", http.StatusMethodNotAllowed)
		return
	}
}

// SpecificSessionHandler handles requests related to a specific authenticated session. For now, the only operation supported is ending the current user's session by using a DELETE request
func (ctx *HandlerContext) SpecificSessionHandler(w http.ResponseWriter, r *http.Request) {
	// check if method is delete
	if r.Method == http.MethodDelete {
		// check for valid user
		currSeshState := &SessionState{}
		_, err := sessions.GetState(r, ctx.Key, ctx.SessionStore, currSeshState)
		if err != nil {
			http.Error(w, fmt.Sprintf("User is notttttt authorized: %v", err),
				http.StatusForbidden)
			return
		}
		idPath := path.Base(r.URL.Path)
		if idPath == "mine" {
			_, err := sessions.EndSession(r, ctx.Key, ctx.SessionStore)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error ending user session"), http.StatusBadRequest)
			}
			// respond with signed out
			w.Write([]byte("signed out"))
		} else {
			http.Error(w, fmt.Sprintf("Cannot end the session of another user"), http.StatusForbidden)
		}
	} else {
		http.Error(w, "Method type not supported", http.StatusMethodNotAllowed)
		return
	}
}
