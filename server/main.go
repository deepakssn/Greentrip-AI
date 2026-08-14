// Package main runs the Greentrip Technologies contact API on Cloud Run.
//
// It exposes a single POST /api/contact endpoint that validates the
// submission and forwards it as a transactional email through the
// Resend HTTP API. No third-party Go modules are required.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"log"
	"net"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"sync"
	"time"
)

// ContactRequest is the JSON body posted from the website.
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Company string `json:"company"`
	Type    string `json:"type"`
	Budget  string `json:"budget"`
	Message string `json:"message"`
	Website string `json:"website"` // honeypot
}

type errorResponse struct {
	Error string `json:"error"`
}

type okResponse struct {
	OK bool   `json:"ok"`
	ID string `json:"id,omitempty"`
}

// Configuration sourced from environment.
type config struct {
	emailHubURL    string
	emailHubKey    string
	toAddr         string
	allowedOrigins map[string]struct{}
}

func loadConfig() config {
	c := config{
		emailHubURL:    envOr("EMAIL_HUB_URL", "https://email-hub-service-752257996886.us-central1.run.app/send"),
		emailHubKey:    os.Getenv("EMAIL_HUB_API_KEY"),
		toAddr:         envOr("CONTACT_TO", "support@greentripai.com"),
		allowedOrigins: map[string]struct{}{},
	}
	origins := envOr("ALLOWED_ORIGINS", "https://greentripai.com,https://www.greentripai.com,http://localhost:5173")
	for _, o := range strings.Split(origins, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			c.allowedOrigins[o] = struct{}{}
		}
	}
	return c
}

func envOr(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

// Simple in-memory rate limiter: max N reqs per IP per window.
type rateLimiter struct {
	mu      sync.Mutex
	hits    map[string][]time.Time
	limit   int
	window  time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{hits: map[string][]time.Time{}, limit: limit, window: window}
}

func (r *rateLimiter) allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	now := time.Now()
	cutoff := now.Add(-r.window)
	bucket := r.hits[ip]
	kept := bucket[:0]
	for _, t := range bucket {
		if t.After(cutoff) {
			kept = append(kept, t)
		}
	}
	if len(kept) >= r.limit {
		r.hits[ip] = kept
		return false
	}
	r.hits[ip] = append(kept, now)
	return true
}

func main() {
	cfg := loadConfig()
	limiter := newRateLimiter(8, 10*time.Minute)

	mux := http.NewServeMux()
	// Cloud Run's frontend intercepts /healthz and never forwards it to the
	// container, so /health is the probe path that actually works there.
	health := func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/healthz", health)
	mux.HandleFunc("/api/contact", func(w http.ResponseWriter, r *http.Request) {
		handleContact(w, r, cfg, limiter)
	})

	port := envOr("PORT", "8080")
	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           withCORS(cfg, mux),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       20 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("greentripai-api listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server: %v", err)
	}
}

func withCORS(cfg config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, ok := cfg.allowedOrigins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				w.Header().Set("Access-Control-Max-Age", "600")
			}
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleContact(w http.ResponseWriter, r *http.Request, cfg config, lim *rateLimiter) {
	if r.Method != http.MethodPost {
		writeErr(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	ip := clientIP(r)
	if !lim.allow(ip) {
		writeErr(w, http.StatusTooManyRequests, "too many requests, please try again later")
		return
	}

	var req ContactRequest
	dec := json.NewDecoder(io.LimitReader(r.Body, 1<<16))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if strings.TrimSpace(req.Website) != "" {
		writeJSON(w, http.StatusOK, okResponse{OK: true})
		return
	}

	if err := validate(&req); err != nil {
		writeErr(w, http.StatusBadRequest, err.Error())
		return
	}

	if cfg.emailHubKey == "" {
		log.Printf("[contact] EMAIL_HUB_API_KEY not configured; logging submission only: %+v", req)
		writeJSON(w, http.StatusOK, okResponse{OK: true})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	id, err := sendViaEmailHub(ctx, cfg, req, ip)
	if err != nil {
		log.Printf("[contact] email-hub send failed: %v", err)
		writeErr(w, http.StatusBadGateway, "could not send your message right now")
		return
	}
	log.Printf("[contact] sent id=%s from=%s type=%s", id, req.Email, req.Type)
	writeJSON(w, http.StatusOK, okResponse{OK: true, ID: id})
}

func validate(r *ContactRequest) error {
	r.Name = strings.TrimSpace(r.Name)
	r.Email = strings.TrimSpace(r.Email)
	r.Company = strings.TrimSpace(r.Company)
	r.Type = strings.TrimSpace(r.Type)
	r.Budget = strings.TrimSpace(r.Budget)
	r.Message = strings.TrimSpace(r.Message)

	if r.Name == "" || len(r.Name) > 200 {
		return errors.New("name is required")
	}
	if _, err := mail.ParseAddress(r.Email); err != nil {
		return errors.New("a valid email is required")
	}
	if r.Message == "" || len(r.Message) > 8000 {
		return errors.New("message is required (max 8000 chars)")
	}
	if len(r.Company) > 200 || len(r.Budget) > 80 || len(r.Type) > 40 {
		return errors.New("field too long")
	}
	switch r.Type {
	case "", "support", "project", "help", "other":
	default:
		return errors.New("invalid inquiry type")
	}
	return nil
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := strings.Index(xff, ","); i >= 0 {
			return strings.TrimSpace(xff[:i])
		}
		return strings.TrimSpace(xff)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// emailHubRequest mirrors the Email Hub /send payload.
type emailHubRequest struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html,omitempty"`
	Text    string   `json:"text,omitempty"`
}

type emailHubResponse struct {
	Success   bool   `json:"success"`
	MessageID string `json:"message_id"`
	Service   string `json:"service"`
	Error     string `json:"error"`
}

func sendViaEmailHub(ctx context.Context, cfg config, c ContactRequest, ip string) (string, error) {
	subject := fmt.Sprintf("[Greentrip Technologies] %s — %s", titleCase(orDefault(c.Type, "inquiry")), c.Name)
	payload := emailHubRequest{
		To:      []string{cfg.toAddr},
		Subject: subject,
		HTML:    buildHTMLBody(c, ip),
		Text:    buildPlainBody(c, ip),
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(
		ctx, http.MethodPost, cfg.emailHubURL, bytes.NewReader(body),
	)
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", cfg.emailHubKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<16))
	var out emailHubResponse
	_ = json.Unmarshal(respBody, &out)
	if resp.StatusCode >= 300 || (!out.Success && out.MessageID == "") {
		errMsg := out.Error
		if errMsg == "" {
			errMsg = string(respBody)
		}
		return "", fmt.Errorf("email-hub status=%d error=%s", resp.StatusCode, errMsg)
	}
	return out.MessageID, nil
}

func titleCase(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func orDefault(s, d string) string {
	if s == "" {
		return d
	}
	return s
}

func buildPlainBody(c ContactRequest, ip string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "New Greentrip Technologies %s submission\n\n", orDefault(c.Type, "inquiry"))
	fmt.Fprintf(&b, "Name:    %s\n", c.Name)
	fmt.Fprintf(&b, "Email:   %s\n", c.Email)
	if c.Company != "" {
		fmt.Fprintf(&b, "Company: %s\n", c.Company)
	}
	if c.Budget != "" {
		fmt.Fprintf(&b, "Budget:  %s\n", c.Budget)
	}
	fmt.Fprintf(&b, "Type:    %s\n", orDefault(c.Type, "inquiry"))
	fmt.Fprintf(&b, "IP:      %s\n", ip)
	fmt.Fprintf(&b, "Time:    %s\n\n", time.Now().UTC().Format(time.RFC3339))
	b.WriteString("Message:\n")
	b.WriteString(c.Message)
	b.WriteString("\n")
	return b.String()
}

func buildHTMLBody(c ContactRequest, ip string) string {
	esc := html.EscapeString
	row := func(k, v string) string {
		if v == "" {
			return ""
		}
		return fmt.Sprintf(
			`<tr><td style="padding:6px 12px;color:#6b7280;font:12px/1.4 system-ui">%s</td>`+
				`<td style="padding:6px 12px;color:#111827;font:14px/1.5 system-ui">%s</td></tr>`,
			esc(k), esc(v),
		)
	}
	msg := strings.ReplaceAll(esc(c.Message), "\n", "<br/>")
	return fmt.Sprintf(`<!doctype html><html><body style="background:#f6f7fb;margin:0;padding:24px">
<table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb" cellspacing="0" cellpadding="0">
  <tr><td style="padding:20px 24px;background:linear-gradient(135deg,#aec479,#7c9644);color:#0e110a;font:600 16px/1.4 system-ui">
    Greentrip Technologies — New %s submission
  </td></tr>
  <tr><td style="padding:20px 24px">
    <table style="width:100%%;border-collapse:collapse">%s%s%s%s%s%s</table>
    <h3 style="margin:18px 0 8px;font:600 14px/1.4 system-ui;color:#111827">Message</h3>
    <div style="font:14px/1.6 system-ui;color:#111827;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px">%s</div>
  </td></tr>
  <tr><td style="padding:14px 24px;color:#6b7280;font:12px/1.4 system-ui;border-top:1px solid #e5e7eb">
    Reply directly to this email to reach %s.
  </td></tr>
</table></body></html>`,
		esc(orDefault(c.Type, "inquiry")),
		row("Name", c.Name),
		row("Email", c.Email),
		row("Company", c.Company),
		row("Type", c.Type),
		row("Budget", c.Budget),
		row("IP / Time", ip+" · "+time.Now().UTC().Format(time.RFC3339)),
		msg,
		esc(c.Email),
	)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, errorResponse{Error: msg})
}
