package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync/atomic"
	"time"

	"github.com/go-redis/redis"

	"final-project/servers/gateway/handlers"
	"final-project/servers/gateway/models/users"
	"final-project/servers/gateway/sessions"
)

type Director func(r *http.Request)

// main is the main entry point for the server
func main() {
	addr := os.Getenv("ADDR")

	if len(addr) == 0 {
		addr = ":443"
	}

	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")
	sessionKey := os.Getenv("SESSIONKEY")
	if len(sessionKey) == 0 {
		log.Fatal("No Session Key found")
	}
	redisAddr := os.Getenv("REDISADDR")
	if len(redisAddr) == 0 {
		log.Fatal("No redis addr found")
	}
	dsn := os.Getenv("DSN")
	if len(dsn) == 0 {
		log.Fatal("No DSN found")
	}

	redisdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	seshStore := sessions.NewRedisStore(redisdb, time.Hour)
	userStore, err := users.NewMySQLStore(dsn)
	if err != nil {
		fmt.Printf("Error connecting to database: %v", err)
		os.Exit(1)
	}
	ctx := handlers.NewHandlerContext(sessionKey, seshStore, userStore)

	postsAddresses := strings.Split(os.Getenv("POSTSSERVER"), ",")
	if len(postsAddresses) == 0 {
		postsAddresses = append(postsAddresses, "http://posts_server:4000")
	}

	var postsURLs []*url.URL

	for _, v := range postsAddresses {
		ParsedURL, err := url.Parse(v)
		if err != nil {
			fmt.Printf("Error parsing url: %v", err)
			os.Exit(1)
		}
		postsURLs = append(postsURLs, ParsedURL)
	}

	postsProxy := &httputil.ReverseProxy{Director: GenerateCustomDirector(postsURLs, ctx)}

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/", ctx.SpecificUserHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", ctx.SpecificSessionHandler)
	mux.Handle("/posts", postsProxy)
	mux.Handle("/posts/", postsProxy)

	wrappedMux := handlers.NewCors(mux)

	log.Printf("Server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, wrappedMux))
}

// GenerateCustomDirector returns a new Director
//Balances user requests between target URLS
//adds X-user header only if the request is authenticated
func GenerateCustomDirector(targets []*url.URL, ctx *handlers.HandlerContext) Director {
	var counter int32
	counter = 0

	return func(r *http.Request) {
		targ := targets[int(counter)%len(targets)]
		atomic.AddInt32(&counter, 1)

		r.Header.Add("X-Forwarded-Host", r.Host)
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme

		xuser, err := getXUser(r, ctx)
		if err == nil {
			r.Header.Set("X-user", xuser)
		} else {
			log.Printf("no auth: %v\n", err)
		}
	}
}

func getXUser(r *http.Request, ctx *handlers.HandlerContext) (string, error) {
	if len(r.Header.Get("X-user")) > 0 {
		log.Println("removing x-user from client request")
		r.Header.Del("X-user")
	}
	sessState := handlers.SessionState{}
	_, err := sessions.GetState(r, ctx.Key, ctx.SessionStore, &sessState)
	if err != nil {
		log.Printf("Error getting session state from request: %v\n", err)
		return "INVALID", errors.New("Invalid session")
	}

	userJSON, err := json.Marshal(sessState.User)
	if err != nil {
		return "INVALID", errors.New("Could not convert user to json")
	}

	return string(userJSON), nil
}
