package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsHandler(t *testing.T) {
	// test nil handler
	var nilH http.Handler
	nilCors := NewCors(nilH)
	if nilCors != nil {
		t.Errorf("Testing CORS: expected nil CORS object but got non-nil CORS object")
	}

	// test valid handler
	validH := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	})
	validCors := NewCors(validH)
	if validCors == nil {
		t.Errorf("Testing CORS: expected valid CORS object but got nil CORS object")
	}

	// check valid handler response
	req, err := http.NewRequest("GET", "/v1/users", nil)
	if err != nil {
		t.Errorf("Testing CORS: Error creating request to pass to handler")
	}
	rr := httptest.NewRecorder()
	validCors.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Testing CORS: handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	if header := rr.Header().Get("Access-Control-Allow-Origin"); header != "*" {
		t.Errorf("Header Access-Control-Allow-Origin does not match: got %v want %v",
			header, "*")
	}
	if header := rr.Header().Get("Access-Control-Allow-Methods"); header != "GET, PUT, POST, PATCH, DELETE" {
		t.Errorf("Header Access-Control-Allow-Methods does not match: got %v want %v",
			header, "GET, PUT, POST, PATCH, DELETE")
	}
	if header := rr.Header().Get("Access-Control-Allow-Headers"); header != "Content-Type, Authorization" {
		t.Errorf("Header Access-Control-Allow-Headers does not match: got %v want %v",
			header, "Content-Type, Authorization")
	}
	if header := rr.Header().Get("Access-Control-Expose-Headers"); header != "Authorization" {
		t.Errorf("Header Access-Control-Expose-Headers does not match: got %v want %v",
			header, "Authorization")
	}
	if header := rr.Header().Get("Access-Control-Max-Age"); header != "600" {
		t.Errorf("Header Access-Control-Max-Age does not match: got %v want %v",
			header, "600")
	}

}
