# AGENTS.md

Operating manual for AI coding agents (and humans) working on this repository.

It describes **what is here**, **how it is wired**, **how to run / build / deploy**, and **the conventions to follow** so the next agent can ship changes without re-discovering the architecture.

---

## 1. Project overview

This repository hosts the **GreentripAI marketing site** plus a **shared Go backend** that handles its contact and lead forms.

The repo also still contains two earlier brand clones (Pro7AI and Triyambaka). They share the same component code and design tokens; only brand strings differ. GreentripAI is the active brand — treat the others as legacy unless told otherwise.

| Brand | Live URL | Source | Hosting target |
| --- | --- | --- | --- |
| **Greentrip Technologies** (active) | https://greentripai-ai.web.app | `web/` | `greentripai` |
| Pro7AI (legacy) | https://pro7.web.app | `web/` | `pro7ai` |
| Triyambaka (legacy) | https://triyambaka.web.app | `web-triyambaka/` | `triyambaka` |
| Contact API | https://pro7ai-api-twvm6sdgla-uc.a.run.app | `server/` | Cloud Run |

- **Intended domain:** `greentripai.com` (not yet attached — see §8).
- **Contact address:** `support@greentripai.com`.
- **GCP + Firebase project:** `email-hub-service` · **Region:** `us-central1`.

All sites POST their forms to the **same** Cloud Run service via a Firebase Hosting `/api/**` rewrite, so the call is same-origin and never hits CORS. The backend forwards each submission to the **Email Hub**, which delivers the mail.

> **Note on the `greentripai` site ID:** the ID `greentripai` is reserved by another Firebase project, so the site was created as **`greentripai-ai`**. The Hosting *target* is still named `greentripai` and maps to that site.

---

## 2. Repository layout

```
Greentrip-AI/
├── AGENTS.md                  # this file
├── README.md                  # human-facing onboarding
├── deploy.sh                  # one-command deploys (Cloud Run + Hosting)
├── firebase.json              # multi-site Hosting config (3 targets)
├── .firebaserc                # Firebase project + deploy targets
├── .gitignore
│
├── web/                       # GreentripAI frontend (Vite + React + TS + Tailwind)
│   ├── index.html             # SEO title / meta / Open Graph
│   ├── package.json           # Bun is the package manager
│   ├── vite.config.ts         # dev proxy /api → http://localhost:8080
│   ├── tailwind.config.js     # design tokens (colors, fonts, animations)
│   ├── postcss.config.js
│   ├── tsconfig*.json
│   ├── eslint.config.js
│   ├── .env.example
│   ├── public/
│   │   ├── gt-logo.png        # GT brand mark used by Logo.tsx
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx
│       ├── App.tsx            # router
│       ├── index.css          # Tailwind layers + design tokens
│       ├── components/        # Navbar, Footer, Hero, Section, Logo, ScrollToTop
│       ├── data/services.ts   # services / solutions / cases content
│       └── pages/             # Home, Services, Solutions, About,
│                              # CaseStudies, Contact, GTDoc, NotFound
│
├── web-triyambaka/            # legacy brand clone (same layout as web/, no GTDoc page)
│
└── server/                    # Go Cloud Run backend
    ├── go.mod                 # module github.com/pro7ai/pro7ai-api (legacy name)
    ├── main.go                # single-file HTTP server, stdlib only
    ├── Dockerfile             # multi-stage, distroless final image
    ├── .dockerignore
    ├── .env.example
    └── cloudrun.env.yaml      # non-secret env passed at deploy time
```

---

## 3. Frontend stack

- **Framework:** React 19 + Vite 8 + TypeScript
- **Package manager:** **Bun** (required — `bun.lock`, `bun install`, `bun run dev`, `bun run build`)
- **Styling:** TailwindCSS 3 + custom design tokens (`tailwind.config.js`, `src/index.css`)
- **Animation:** `framer-motion` (scroll reveal in `Section.tsx`, `Hero.tsx`, `GTDoc.tsx`)
- **Icons:** `lucide-react@^0.469` — **do not upgrade to `1.x`**, it has incompatible exports
- **Routing:** `react-router-dom` v7
- **Fonts:** Inter, Space Grotesk, JetBrains Mono (Google Fonts import at the top of `src/index.css`)

### Design system

Dark theme built around the brand green **`#aec479`** (sage/olive), with a gold accent and a warm near-black background. Tokens live in `tailwind.config.js`:

| Token | Value | Used for |
| --- | --- | --- |
| `brand.400` | `#aec479` | Primary brand green |
| `brand.500` / `brand.600` | `#97b158` / `#7c9644` | Deeper greens for buttons, glows |
| `accent.cyan` | `#5ec9b1` | Teal-green icon/detail accents |
| `accent.violet` | `#e0b25a` | Warm gold — gradient partner, hover glow |
| `accent.pink` / `accent.lime` | `#e08a6a` / `#cfe08a` | Secondary accents |
| `ink.950` → `ink.600` | `#090b07` → `#28301e` | Warm-dark surfaces |

`accent.cyan` and `accent.violet` keep their original key names for backwards compatibility with existing components — **the names no longer describe the hues.** Recolor the token, don't rename the key, unless you update every usage.

Component classes in `src/index.css`:

- `gradient-text` — animated white → sage → gold heading gradient
- `.glass`, `.glass-strong` — backdrop-blur surfaces
- `.gradient-border` — sage→gold border via a mask pseudo-element
- `.btn-primary` — sage gradient pill with **dark (`ink-950`) text**; light green needs dark text for contrast
- `.btn-ghost`, `.chip`, `.card`, `.input`, `.label`
- `.grid-bg` — radial-masked dotted grid used in hero sections
- Keyframes: `float`, `gradient-x`, `pulse-slow`, `spin-slow`

`index.html` sets `<meta name="theme-color" content="#090b07">` to match the background.

### Routing

`web/src/App.tsx` mounts these inside a single `<BrowserRouter>` (in `main.tsx`), wrapped by `Navbar` / `Footer`:

| Route | Page |
| --- | --- |
| `/` | Home |
| `/services` | Services |
| `/solutions` | Solutions |
| `/case-studies` | CaseStudies |
| `/about` | About |
| `/contact` | Contact |
| `/gtdoc` | GTDoc — AI dental clinic product page |
| `*` | NotFound |

`ScrollToTop.tsx` resets scroll on every route change. `web-triyambaka/` has the same routes **minus** `/gtdoc`.

### Content

All marketing copy is plain TypeScript — there is no CMS:

- `src/data/services.ts` — `services`, `solutions`, `cases` arrays
- `src/pages/*.tsx` — page headlines and descriptions
- `src/pages/GTDoc.tsx` — the GTDoc feature list is a local `features` array
- `index.html` — `<title>`, meta description, Open Graph tags

---

## 4. Forms and the backend contract

### 4.1 Contact form (`src/pages/Contact.tsx`)

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

### 4.2 GTDoc lead form (`src/pages/GTDoc.tsx`)

The `/gtdoc` page collects only **email + phone**. Rather than adding an endpoint, it maps those onto the existing contact payload:

| Payload field | Value |
| --- | --- |
| `name` | email local-part (before `@`) |
| `email` | the submitted email |
| `type` | `"project"` |
| `message` | `"GTDoc early-access request.\nPhone: <phone>…"` |
| `company`, `budget` | empty |
| `website` | honeypot, empty |

**The phone number lives inside `message`.** If you need it as a first-class field, add it to `ContactRequest` in `server/main.go`, surface it in the email body, and redeploy the API — the strict JSON decoder (`DisallowUnknownFields`) will reject an unknown `phone` key until you do.

Both forms POST to `${VITE_API_BASE_URL}/api/contact`. In production `VITE_API_BASE_URL` is empty and `firebase.json` rewrites `/api/**` to Cloud Run, keeping the request same-origin.

---

## 5. Backend (Cloud Run service `pro7ai-api`)

**Single Go file** (`server/main.go`), **stdlib only** (zero third-party Go modules), distroless container.

> The service and Go module are still named `pro7ai-api` / `github.com/pro7ai/pro7ai-api`. Renaming means creating a new Cloud Run service and updating the rewrite in all three `firebase.json` blocks — don't do it casually.

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness probe (returns `200 ok`) |
| GET | `/healthz` | Same handler, but **unreachable on Cloud Run** — see the note below |
| POST | `/api/contact` | Validate submission and forward to the Email Hub |
| OPTIONS | any | CORS preflight |

> **Cloud Run intercepts `/healthz`.** Requests to `https://<service>.run.app/healthz` are answered by Google's frontend with an HTML 404 and never reach the container, even though the handler is registered. Any other unknown path returns Go's plain-text `404 page not found`, which is how you can tell the two apart. **Use `/health` for probes and uptime checks.**

### Request / response

```json
// POST /api/contact
{
  "name": "string (required, <=200)",
  "email": "valid RFC 5322 address (required)",
  "company": "string (<=200, optional)",
  "type": "support | project | help | other",
  "budget": "string (<=80, optional)",
  "message": "string (required, <=8000)",
  "website": "honeypot — must be empty"
}

// 200
{ "ok": true, "id": "<email-hub message_id>" }

// 4xx / 5xx
{ "error": "human-readable reason" }
```

### Security and abuse controls

- **CORS allowlist** (`ALLOWED_ORIGINS`, comma-separated). Exact origin match; otherwise no `Access-Control-Allow-Origin` header.
- **Honeypot** — non-empty `website` returns 200 silently.
- **Rate limit** — in-memory, **8 requests per IP per 10 minutes**. Trusts the first `X-Forwarded-For` hop (set by Cloud Run). In-memory means the limit is per-instance and resets on redeploy.
- **Body limit** — 64 KiB via `io.LimitReader`.
- **Strict JSON** — `DisallowUnknownFields()`.
- **Validation** — required fields, length caps, RFC 5322 email parse, enum check on `type`.

### Email delivery

Forwarded to the **Email Hub**:

- URL: `EMAIL_HUB_URL` (default `https://email-hub-service-752257996886.us-central1.run.app/send`)
- `POST` with `Content-Type: application/json` and `X-API-Key: <EMAIL_HUB_API_KEY>`
- Body: `{ to: [CONTACT_TO], subject, html, text }`
- Response `{ success, message_id, service }` — `message_id` is returned as `id`

Subject pattern: `[Greentrip Technologies] <Type> — <Name>`. The HTML body is a sage→olive branded card listing Name, Email, Company, Type, Budget, IP, UTC timestamp and Message (HTML-escaped, newlines as `<br/>`).

If `EMAIL_HUB_API_KEY` is unset the server logs the submission and returns `200` — handy for local dev.

### Configuration

| Variable | Where it lives | Notes |
| --- | --- | --- |
| `EMAIL_HUB_URL` | `cloudrun.env.yaml` | Email Hub `/send` endpoint |
| `EMAIL_HUB_API_KEY` | **Secret Manager** | Secret `EMAIL_HUB_API_KEY`, mounted via `--set-secrets` |
| `CONTACT_TO` | `cloudrun.env.yaml` | `support@greentripai.com` |
| `ALLOWED_ORIGINS` | `cloudrun.env.yaml` | Comma-separated site origins + `localhost:5173` |
| `PORT` | injected by Cloud Run | Default `8080` |

`cloudrun.env.yaml` is the single source of truth for the non-secret env. Cloud Run does **not** pick it up until someone deploys, so editing it is only half the job — always follow with `./deploy.sh api`.

Run `./deploy.sh status` to diff the live revision against the repo. It exists because this drifted once before: the rebrand updated the yaml but never redeployed, so submissions kept landing in the old Pro7AI inbox for days while every form still returned `200`. Nothing surfaces that except an explicit diff.

---

## 6. Hosting topology

```
                              Firebase Hosting (project: email-hub-service)
  https://greentripai-ai.web.app ──►  site "greentripai-ai"  target greentripai  (web/dist)
  https://pro7.web.app           ──►  site "pro7"            target pro7ai       (web/dist)
  https://triyambaka.web.app     ──►  site "triyambaka"      target triyambaka   (web-triyambaka/dist)
                                              │
                                              │  /api/**  rewrite
                                              ▼
                                  Cloud Run: pro7ai-api (us-central1, public)
                                              │  X-API-Key
                                              ▼
                                  Email Hub /send ──►  CONTACT_TO
```

`firebase.json` holds a `hosting` **array of three entries**, all rewriting `/api/**` to the same Cloud Run service and all serving SPA fallback (`** → /index.html`) with the same cache and security headers. `.firebaserc` declares the targets:

```json
"targets": {
  "email-hub-service": {
    "hosting": {
      "greentripai": ["greentripai-ai"],
      "pro7ai": ["pro7"],
      "triyambaka": ["triyambaka"]
    }
  }
}
```

Note that `greentripai` and `pro7ai` both publish **the same `web/dist` build**, so deploying one and not the other leaves the two URLs on different versions.

---

## 7. Local development

### Prerequisites

| Tool | Min version | Notes |
| --- | --- | --- |
| Bun | 1.3 | Frontend package + script runner |
| Go | 1.25 | Backend |
| Firebase CLI | 15 | `firebase --version` |
| `gcloud` | latest | Authenticated against `email-hub-service` |
| Docker | any | Optional, only to test the image locally |

### Run the site

```bash
cd web
bun install
bun run dev          # http://localhost:5173
```

`web-triyambaka` works the same way — run only one at a time, or change the port.

### Run the backend

```bash
cd server
cp .env.example .env          # set EMAIL_HUB_API_KEY for real email
export $(grep -v '^#' .env | xargs)
go run .                      # http://localhost:8080
```

`vite.config.ts` proxies `/api/*` → `http://localhost:8080`, so both forms work locally with no CORS setup.

### Smoke test

```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","type":"project","message":"Hello"}'
```

---

## 8. Deployment

Use **`./deploy.sh`** from the repo root. It runs preflight checks (`gcloud`, `firebase`, `bun`, active gcloud auth), builds, deploys and health-checks.

```bash
./deploy.sh              # same as "site"
./deploy.sh site         # build web/ → greentripai site (greentripai-ai.web.app)
./deploy.sh api          # Cloud Run backend
./deploy.sh all          # api + greentripai site
./deploy.sh triyambaka   # build web-triyambaka/ → triyambaka site
./deploy.sh pro7ai       # build web/ → legacy pro7 site
./deploy.sh status       # show what is live + diff Cloud Run env vs repo (no deploy)
```

What it does for you: verifies `gcloud` / `firebase` / `bun` and an active gcloud login, confirms the project is reachable, idempotently enables the required APIs, checks the `EMAIL_HUB_API_KEY` secret exists **before** starting a Cloud Build, maps the Hosting target if `.firebaserc` is missing it, asserts the build produced `dist/index.html`, and health-checks `/health` after an API deploy.

Overridable env: `PROJECT_ID`, `REGION`, `SERVICE`, `SECRET_NAME`, `SITE_ID`, `HOSTING_TARGET`, `SKIP_API_ENABLE`.

### Equivalent manual commands

```bash
# Backend
cd server
gcloud run deploy pro7ai-api \
  --source . --region us-central1 --project email-hub-service \
  --allow-unauthenticated \
  --env-vars-file cloudrun.env.yaml \
  --set-secrets EMAIL_HUB_API_KEY=EMAIL_HUB_API_KEY:latest \
  --memory 256Mi --cpu 1 --max-instances 5 --timeout 30s

# Env-only update (no rebuild)
gcloud run services update pro7ai-api \
  --region us-central1 --project email-hub-service \
  --env-vars-file cloudrun.env.yaml

# Frontend
cd web && bun run build && cd ..
firebase deploy --only hosting:greentripai --project email-hub-service
```

### Secret rotation

```bash
printf 'NEW_KEY_VALUE' | gcloud secrets versions add EMAIL_HUB_API_KEY \
  --data-file=- --project email-hub-service
gcloud run services update pro7ai-api \
  --region us-central1 --project email-hub-service \
  --set-secrets EMAIL_HUB_API_KEY=EMAIL_HUB_API_KEY:latest
```

### Logs

```bash
gcloud run services logs tail pro7ai-api \
  --region us-central1 --project email-hub-service
```

---

## 9. Custom domain (`greentripai.com`)

Not attached yet. DNS for the brand domains lives in **Cloudflare**.

1. Firebase console → Hosting → site `greentripai-ai` → **Add custom domain** (`greentripai.com`).
2. Firebase returns a one-time TXT record plus two A records for the apex.
3. In Cloudflare DNS: add the TXT record, the two A records on `@`, and a CNAME `www → greentripai-ai.web.app`.
4. Set all three to **"DNS only" (gray cloud)**. Firebase must reach the apex directly to provision and renew its managed certificate.
5. Cloudflare → SSL/TLS → set encryption mode to **Full** (never Flexible — it causes redirect loops with Firebase).
6. Wait 5–60 minutes for DNS, up to 24h for the certificate. Status moves `Needs setup → Pending → Connected`.
7. `https://greentripai.com` and `https://www.greentripai.com` are already in `ALLOWED_ORIGINS`.

---

## 10. Adding another brand site

1. `cp -R web web-<brand>` then `rm -rf web-<brand>/{node_modules,dist}`.
2. Replace brand strings (see §11).
3. `firebase hosting:sites:create <site> --project email-hub-service`.
4. `firebase target:apply hosting <target> <site> --project email-hub-service`.
5. Append a `hosting` entry in `firebase.json` with the new `target`, `public: "web-<brand>/dist"` and the same `/api/**` rewrite.
6. Add the new origin to `ALLOWED_ORIGINS` in `server/cloudrun.env.yaml` and run `./deploy.sh api`.
7. Add a case to `deploy.sh` and deploy.

The Cloud Run service is untouched — one backend serves any number of frontends.

---

## 11. Brand replacement recipe

Places that carry brand strings: `index.html` (`<title>`, description, `og:title`, `og:url`), `components/Navbar.tsx` and `components/Footer.tsx` (the split `Greentrip <span className="gradient-text">Technologies</span>` wordmark plus the copyright line and mailto), `components/Hero.tsx`, `pages/Home.tsx` (eyebrow), `pages/About.tsx` (description), `pages/Contact.tsx` (email block), and `public/gt-logo.png` referenced by `components/Logo.tsx`.

`Logo.tsx` renders `/gt-logo.png` with no CSS filter — the mark is already brand-green. If you swap in a differently-colored asset, replace the file rather than adding a `hue-rotate` filter.

---

## 12. Conventions for AI agents

- **Do not introduce a CMS or runtime data fetching for marketing copy.** Edit `src/data/services.ts` and `src/pages/*.tsx` directly.
- **Do not add Firebase Functions.** All dynamic behaviour goes through the Go Cloud Run service; new endpoints live in `server/main.go` under `/api/...`.
- **Keep the Go backend dependency-free.** It uses only the standard library. Justify any third-party module in the PR description.
- **Do not switch the email provider in code.** The Email Hub is the only outbound path. Change recipients via `CONTACT_TO`, the hub via `EMAIL_HUB_URL`.
- **Never hardcode the Email Hub API key.** It comes from Secret Manager via `--set-secrets`.
- **Never ship secrets to the frontend.** API keys, internal URLs and tokens belong in the Go service only.
- **Rebuild before deploying.** `firebase deploy` does not build for you — `./deploy.sh` does.
- **Update CORS on new origins:** add to `ALLOWED_ORIGINS` in `cloudrun.env.yaml`, then `./deploy.sh api`.
- **Keep the clones in lockstep** for components and design tokens; only brand strings (and the GreentripAI-only `/gtdoc` page) should differ.
- **Recolor design tokens, don't rename them.** `accent.cyan` / `accent.violet` are historical key names for the current teal and gold.
- **Pin `lucide-react` to `0.x`.** The `1.x` release has incompatible exports.
- **Bun is the package manager.** Don't commit `package-lock.json` or `pnpm-lock.yaml`.
- **Don't enable the Cloudflare orange-cloud proxy** on Firebase-bound DNS records.
- **Cite real outcomes only.** The figures in `Hero.tsx`, `data/services.ts` and `GTDoc.tsx` are illustrative placeholders — replace them with verified numbers before pointing customers at the site.

---

## 13. Reference

- GreentripAI site: https://greentripai-ai.web.app
- GTDoc product page: https://greentripai-ai.web.app/gtdoc
- Pro7AI (legacy): https://pro7.web.app
- Triyambaka (legacy): https://triyambaka.web.app
- Cloud Run service: https://pro7ai-api-twvm6sdgla-uc.a.run.app
- Firebase console: https://console.firebase.google.com/project/email-hub-service/overview
- Cloud Run console: https://console.cloud.google.com/run/detail/us-central1/pro7ai-api?project=email-hub-service
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=email-hub-service
- Email Hub `/send`: `https://email-hub-service-752257996886.us-central1.run.app/send`
- Outbound recipient: `support@greentripai.com`
