# AGENTS.md

Operating manual for AI coding agents (and humans) working on this repository.

This file describes **what is here**, **how it is wired**, **how to run / build / deploy**, and **the conventions to follow** so the next agent can ship changes safely without re-discovering the architecture.

---

## 1. Project overview

This repository hosts **two ultra-modern marketing sites** built from a shared codebase, plus **one shared Go backend** for their contact forms.

| Brand        | Production URL                          | Source                       | Hosting target |
| ------------ | --------------------------------------- | ---------------------------- | -------------- |
| Pro7AI       | https://pro7.web.app                    | `web/`                       | `pro7ai`       |
| Triyambaka   | https://triyambaka.web.app              | `web-triyambaka/`            | `triyambaka`   |
| Contact API  | https://pro7ai-api-752257996886.us-central1.run.app | `server/`         | Cloud Run      |

Both sites have **identical layout, components and copy structure** — only the brand strings differ. Both sites POST their contact form to the **same** Cloud Run service (`pro7ai-api`) via a Firebase Hosting `/api/**` rewrite. The backend forwards every submission to the **Pro7AI Email Hub** which delivers email to `support@pro7ai.com`.

GCP project: **`email-hub-service`**
Firebase project: **`email-hub-service`** (same GCP project)
Region: **`us-central1`**

---

## 2. Repository layout

```
Pro7AI.com/
├── AGENTS.md                  # this file
├── README.md                  # human-facing onboarding
├── firebase.json              # multi-site Hosting config (pro7ai + triyambaka)
├── .firebaserc                # Firebase project + deploy targets
├── .gitignore
│
├── web/                       # Pro7AI frontend (Vite + React + TS + Tailwind)
│   ├── index.html
│   ├── package.json           # uses Bun as the package manager
│   ├── vite.config.ts         # dev proxy /api → http://localhost:8080
│   ├── tailwind.config.js     # custom colors, fonts, animations
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── public/favicon.svg
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx            # router
│       ├── index.css          # Tailwind layers + design tokens
│       ├── vite-env.d.ts
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── Hero.tsx
│       │   ├── Section.tsx    # generic section wrapper w/ scroll-reveal
│       │   ├── Logo.tsx
│       │   └── ScrollToTop.tsx
│       ├── data/
│       │   └── services.ts    # services / solutions / case studies content
│       └── pages/
│           ├── Home.tsx
│           ├── Services.tsx
│           ├── Solutions.tsx
│           ├── About.tsx
│           ├── CaseStudies.tsx
│           ├── Contact.tsx
│           └── NotFound.tsx
│
├── web-triyambaka/            # 1:1 fork of web/ with brand strings replaced
│   └── (same layout as web/)
│
└── server/                    # Go Cloud Run backend
    ├── go.mod
    ├── main.go                # single-file HTTP server, stdlib only
    ├── Dockerfile             # multi-stage, distroless final image
    ├── .dockerignore
    ├── .env.example
    └── cloudrun.env.yaml      # non-secret env passed at deploy time
```

---

## 3. Frontend stack

- **Framework**: React 19 + Vite 8 + TypeScript
- **Package manager**: **Bun** (required — `bun.lock`, `bun install`, `bun run dev`, `bun run build`)
- **Styling**: TailwindCSS 3 + custom design tokens (see `tailwind.config.js` and `src/index.css`)
- **Animation**: `framer-motion` (scroll-reveal in `Section.tsx` + `Hero.tsx`)
- **Icons**: `lucide-react@^0.469` (note: do NOT upgrade to `1.x` — that release has a different API and breaks our imports)
- **Routing**: `react-router-dom` v7
- **Fonts**: Inter, Space Grotesk, JetBrains Mono (loaded via Google Fonts in `src/index.css`)

### Design system (where the look comes from)

- Dark theme. Background uses radial brand-blue + violet glows over a deep ink palette.
- `gradient-text` class — animated white→indigo→violet gradient for headings.
- `.glass`, `.glass-strong` — backdrop-blur cards.
- `.gradient-border` — pseudo-element with a brand→violet→cyan border-mask.
- `.btn-primary` — blue→violet gradient pill with `shadow-glow`.
- `.btn-ghost`, `.chip`, `.card`, `.input`, `.label` — utility components.
- `grid-bg` — radial-masked dotted grid used in `Hero.tsx`.
- Custom keyframes: `float`, `gradient-x`, `pulse-slow`, `spin-slow`.

### Routing

`src/App.tsx` mounts these routes inside a single `<BrowserRouter>`:

```
/              → Home
/services      → Services
/solutions     → Solutions
/case-studies  → CaseStudies
/about         → About
/contact       → Contact
*              → NotFound
```

`ScrollToTop.tsx` resets scroll on every route change.

### Content

All marketing copy lives in plain TS files — there is no CMS:

- `src/data/services.ts` — `services`, `solutions`, `cases` arrays.
- `src/pages/*.tsx` — page-level headlines and descriptions.
- `index.html` — SEO `<title>`, meta description, Open Graph tags.

### Contact form contract (`src/pages/Contact.tsx`)

```ts
type FormState = {
  name: string;
  email: string;
  company: string;
  type: "support" | "project" | "help" | "other";
  budget: string;
  message: string;
  website?: string; // honeypot — must stay empty
};
```

Submits `POST ${VITE_API_BASE_URL}/api/contact`. In production `VITE_API_BASE_URL` is empty; `firebase.json` rewrites `/api/**` to the Cloud Run service so the call is **same-origin** and never hits CORS.

---

## 4. Backend (Cloud Run service `pro7ai-api`)

**Single Go file** (`server/main.go`), **stdlib only** (zero third-party Go modules), distroless container.

### Endpoints

| Method | Path           | Purpose                                           |
| ------ | -------------- | ------------------------------------------------- |
| GET    | `/healthz`     | Liveness probe (returns `200 ok`)                |
| POST   | `/api/contact` | Validate submission and forward to Email Hub     |
| OPTIONS| any            | CORS preflight                                    |

### Request / response

```json
// POST /api/contact request body
{
  "name":     "string (required, ≤200)",
  "email":    "valid RFC 5322 address (required)",
  "company":  "string (≤200, optional)",
  "type":     "support | project | help | other",
  "budget":   "string (≤80, optional)",
  "message":  "string (required, ≤8000)",
  "website":  "honeypot — must be empty"
}

// 200 response
{ "ok": true, "id": "<email-hub message_id>" }

// 4xx / 5xx response
{ "error": "human-readable reason" }
```

### Security and abuse controls

- **CORS allowlist** (`ALLOWED_ORIGINS` env, comma-separated). Origin must match exactly; otherwise no `Access-Control-Allow-Origin` header is emitted.
- **Honeypot** — if the `website` field is non-empty, return 200 silently. Bots fill it; humans don't see it.
- **Rate limit** — in-memory limiter, **8 requests per IP per 10 minutes**. Trusts `X-Forwarded-For` first hop (Cloud Run sets it).
- **Body limit** — request body capped at 64 KiB (`io.LimitReader`).
- **Strict JSON** — `DisallowUnknownFields()`.
- **Validation** — required fields, length caps, RFC 5322 email parse, enum check on `type`.

### Email delivery

Submissions are forwarded to the **Pro7AI Email Hub**:

- URL (env `EMAIL_HUB_URL`, default `https://email-hub-service-752257996886.us-central1.run.app/send`)
- Method `POST`
- Headers: `Content-Type: application/json`, `X-API-Key: <EMAIL_HUB_API_KEY>`
- Body: `{ to: ["support@pro7ai.com"], subject, html, text }`
- Response: `{ success, message_id, service }` — `message_id` is surfaced as `id` in our 200 response.

Subject pattern: `[Pro7AI] <Type> — <Name>` (kept as-is for the Triyambaka site too — single backend, single recipient).

HTML body is a styled card containing **Name, Email, Company, Type, Budget, IP, UTC timestamp, Message** (HTML-escaped, newlines rendered as `<br/>`).

### Configuration (`server/cloudrun.env.yaml` + Secret Manager)

| Variable             | Where it lives        | Notes                                                           |
| -------------------- | --------------------- | --------------------------------------------------------------- |
| `EMAIL_HUB_URL`      | env (yaml)            | Pro7AI Email Hub `/send` endpoint                              |
| `EMAIL_HUB_API_KEY`  | **Secret Manager**    | Secret name `EMAIL_HUB_API_KEY`, mounted via `--set-secrets`   |
| `CONTACT_TO`         | env (yaml)            | `support@pro7ai.com`                                            |
| `ALLOWED_ORIGINS`    | env (yaml)            | Comma-separated; includes both sites + `localhost:5173`        |
| `PORT`               | injected by Cloud Run | Default `8080`                                                  |

If `EMAIL_HUB_API_KEY` is unset, the server logs the submission and returns `200 ok` (useful for local dev).

---

## 5. Hosting topology

```
                          ┌────────────────────────────────┐
                          │       Firebase Hosting         │
 https://pro7.web.app ───►│  site "pro7"     target pro7ai │──┐
 https://triyambaka.web.app│ site "triyambaka" target triyambaka│
                          │     (web/dist or                  │  │
                          │      web-triyambaka/dist)         │  │
                          └────────────────────────────────┘  │
                                                              │  /api/** rewrite
                                                              ▼
                                          ┌────────────────────────────┐
                                          │  Cloud Run: pro7ai-api     │
                                          │  us-central1, public       │
                                          └─────────────┬──────────────┘
                                                        │  X-API-Key
                                                        ▼
                                          ┌────────────────────────────┐
                                          │  Email Hub /send           │
                                          │  delivers to               │
                                          │  support@pro7ai.com        │
                                          └────────────────────────────┘
```

`firebase.json` has a `hosting` **array of two entries**, both pointing `/api/**` rewrites at the same Cloud Run service. `.firebaserc` declares deploy targets:

```json
"targets": {
  "email-hub-service": {
    "hosting": {
      "pro7ai":     ["pro7"],
      "triyambaka": ["triyambaka"]
    }
  }
}
```

---

## 6. Local development

### Prerequisites

| Tool              | Min version | Notes                                |
| ----------------- | ----------- | ------------------------------------ |
| Bun               | 1.3         | Frontend package + script runner     |
| Go                | 1.25        | Backend                              |
| Firebase CLI      | 15          | `firebase --version`                 |
| `gcloud`          | latest      | Authenticated against `email-hub-service` |
| Docker (optional) | any         | Only if you want to test the image   |

### Run the Pro7AI site

```bash
cd web
bun install
bun run dev          # http://localhost:5173
```

### Run the Triyambaka site

```bash
cd web-triyambaka
bun install
bun run dev          # http://localhost:5173 (run only one at a time, or change port)
```

### Run the backend

```bash
cd server
cp .env.example .env
# edit .env — at minimum set EMAIL_HUB_API_KEY if you want real emails
export $(grep -v '^#' .env | xargs)
go run .             # http://localhost:8080
```

`vite.config.ts` proxies `/api/*` → `http://localhost:8080`, so the contact form on either site talks to the backend transparently with no CORS gymnastics.

### Quick API smoke test

```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","type":"project","message":"Hello"}'
```

---

## 7. Deployment

All commands run from the repo root unless noted.

### 7.1 Backend — Cloud Run

```bash
cd server
gcloud run deploy pro7ai-api \
  --source . \
  --region us-central1 \
  --project email-hub-service \
  --allow-unauthenticated \
  --env-vars-file cloudrun.env.yaml \
  --set-secrets EMAIL_HUB_API_KEY=EMAIL_HUB_API_KEY:latest \
  --memory 256Mi --cpu 1 --max-instances 5 --timeout 30s
```

This builds via Cloud Build (using `Dockerfile`), pushes to Artifact Registry, and rolls out a new revision.

To update **only env vars** (no rebuild):

```bash
gcloud run services update pro7ai-api \
  --region us-central1 --project email-hub-service \
  --env-vars-file cloudrun.env.yaml
```

### 7.2 Secret rotation

```bash
printf 'NEW_KEY_VALUE' | gcloud secrets versions add EMAIL_HUB_API_KEY \
  --data-file=- --project email-hub-service
gcloud run services update pro7ai-api \
  --region us-central1 --project email-hub-service \
  --set-secrets EMAIL_HUB_API_KEY=EMAIL_HUB_API_KEY:latest
```

### 7.3 Frontends — Firebase Hosting

```bash
# Pro7AI
cd web && bun run build && cd ..
firebase deploy --only hosting:pro7ai --project email-hub-service

# Triyambaka
cd web-triyambaka && bun run build && cd ..
firebase deploy --only hosting:triyambaka --project email-hub-service

# Both at once
firebase deploy --only hosting --project email-hub-service
```

### 7.4 Logs

```bash
gcloud run services logs tail pro7ai-api \
  --region us-central1 --project email-hub-service
```

---

## 8. Custom domains

DNS for both apex domains lives in **Cloudflare**.

For each domain (`pro7ai.com`, `triyambaka.com`):

1. Firebase console → Hosting → site (`pro7` / `triyambaka`) → **Add custom domain**.
2. Firebase returns a TXT (one-time) plus two A records for the apex.
3. In Cloudflare DNS:
   - Add the TXT verification record.
   - Add the two A records on `@`.
   - Add a CNAME `www → <site>.web.app`.
   - **Set proxy status to "DNS only" (gray cloud)** for all three. Firebase needs to reach the apex directly to provision and renew its managed SSL cert.
4. Cloudflare → SSL/TLS → Overview → set encryption mode to **Full** (never Flexible — that causes redirect loops with Firebase).
5. Wait 5–60 minutes for DNS, up to 24h for the cert. Firebase status moves `Needs setup → Pending → Connected`.
6. Once connected, the apex is also a valid origin in `ALLOWED_ORIGINS` — already added.

---

## 9. Adding more sites (pattern)

To add a third brand (e.g. `foo.web.app`) without changing the backend:

1. `cp -R web web-foo` and replace brand strings (see §10).
2. `firebase hosting:sites:create foo --project email-hub-service`.
3. Append to `.firebaserc → targets.email-hub-service.hosting`:
   ```json
   "foo": ["foo"]
   ```
4. Append a new entry to the `hosting` array in `firebase.json` with `target: "foo"`, `public: "web-foo/dist"`, and the same `/api/**` rewrite.
5. Add `https://foo.web.app` (and any custom domain) to `ALLOWED_ORIGINS` in `server/cloudrun.env.yaml` and run `gcloud run services update`.
6. `cd web-foo && bun install && bun run build && cd ..`.
7. `firebase deploy --only hosting:foo`.

The Cloud Run service stays untouched — same backend serves any number of frontends.

---

## 10. Brand replacement recipe

Used when forking `web/` into a new brand directory. Run from the repo root after `cp -R web web-<brand>` and `rm -rf web-<brand>/{node_modules,dist,bun.lock}`:

```bash
cd web-<brand>
find src index.html -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.html' \) -print0 \
  | xargs -0 sed -i '' \
      -e 's|Pro<span className="gradient-text">7AI</span>|<First><span className="gradient-text"><Second></span>|g' \
      -e 's/Pro7AI/<NewBrand>/g' \
      -e 's/pro7ai\.com/<newdomain>.com/g' \
      -e 's/pro7\.web\.app/<newsite>.web.app/g'

# Restore the shared support email — we always want submissions to land at support@pro7ai.com
sed -i '' 's/support@<newdomain>\.com/support@pro7ai.com/g' \
  src/pages/Contact.tsx src/components/Footer.tsx
```

Brand-relevant places to double-check by hand: `index.html` (`<title>`, meta description, og:title, og:url), `Hero.tsx`, `About.tsx`, `Footer.tsx`, `Navbar.tsx` logo split.

---

## 11. Conventions for AI agents

When editing this repository:

- **Do not introduce a CMS or runtime data fetching for marketing copy.** Edit `src/data/services.ts` and `src/pages/*.tsx` directly.
- **Do not add Firebase Functions.** All dynamic behaviour goes through the Go Cloud Run service. New endpoints live in `server/main.go` under `/api/...`.
- **Do not switch the email provider in code.** The Email Hub is the only outbound path. To change recipients, edit `CONTACT_TO`. To change the hub, edit `EMAIL_HUB_URL`.
- **Do not hardcode the Email Hub API key.** It must always come from Secret Manager and be referenced via `--set-secrets`.
- **Do not enable the Cloudflare orange-cloud proxy** on Firebase-bound DNS records.
- **Do not ship private code paths to the frontend.** Anything secret (API keys, internal URLs, auth tokens) belongs in the Go service only.
- **Keep the Go backend dependency-free.** It currently uses only `stdlib`. If a third-party module becomes truly necessary, justify it in the PR description.
- **Always rebuild the affected `web*/dist` before `firebase deploy --only hosting:*`.** The CLI does not run the build for you.
- **Update CORS on env changes**: any new site origin must be added to `ALLOWED_ORIGINS` in `cloudrun.env.yaml` and pushed via `gcloud run services update`.
- **Keep both site clones in lockstep** unless a brand-specific deviation is intentional. Components, design tokens and form contract should match — only brand strings differ.
- **Lucide icons**: pin `lucide-react` to the `0.x` line. The `1.x` release has incompatible exports.
- **Bun is the package manager** for the frontends. Don't commit a `package-lock.json` or `pnpm-lock.yaml`.
- **Cite real outcomes only.** The numbers in `Hero.tsx` and `data/services.ts` are illustrative defaults — replace them with verified figures before pointing real customers at the site.

---

## 12. Reference URLs

- Pro7AI site: https://pro7.web.app
- Triyambaka site: https://triyambaka.web.app
- Cloud Run service: https://pro7ai-api-752257996886.us-central1.run.app
- Firebase console: https://console.firebase.google.com/project/email-hub-service/overview
- Cloud Run console: https://console.cloud.google.com/run/detail/us-central1/pro7ai-api?project=email-hub-service
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=email-hub-service
- Email Hub `/send`: `https://email-hub-service-752257996886.us-central1.run.app/send`
- Outbound recipient: `support@pro7ai.com`
