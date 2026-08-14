# GreentripAI

Marketing site for **Greentrip Technologies** — an applied AI consulting brand — plus the Go service that handles its contact and lead forms.

- **Live:** https://greentripai-ai.web.app (intended domain: `greentripai.com`)
- **Frontend:** React 19 + Vite 8 + TypeScript + TailwindCSS + framer-motion, built with Bun
- **Backend:** Go (standard library only) on Google Cloud Run
- **Hosting:** Firebase Hosting, with `/api/**` rewritten to Cloud Run
- **Contact:** `support@greentripai.com`

```
.
├── deploy.sh          # one-command deploys
├── firebase.json      # 3 Hosting targets
├── .firebaserc        # project + target mapping
├── web/               # GreentripAI frontend (also serves the legacy pro7 site)
├── web-triyambaka/    # legacy brand clone
└── server/            # Go backend — POST /api/contact
```

For architecture details, conventions and the full deployment runbook, read **[AGENTS.md](./AGENTS.md)**.

---

## 1. Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| [Bun](https://bun.sh) | `>= 1.3` | Frontend packages + scripts |
| [Go](https://go.dev/dl/) | `>= 1.25` | Backend |
| [Firebase CLI](https://firebase.google.com/docs/cli) | `>= 15` | Hosting deploys |
| [`gcloud`](https://cloud.google.com/sdk/docs/install) | latest | Cloud Run deploys, authenticated against `email-hub-service` |

## 2. Local development

### Frontend

```bash
cd web
bun install
bun run dev        # http://localhost:5173
```

`vite.config.ts` proxies `/api/*` to `http://localhost:8080`, so the forms talk to the local Go backend with no CORS setup.

### Backend

```bash
cd server
cp .env.example .env      # set EMAIL_HUB_API_KEY to send real email
export $(grep -v '^#' .env | xargs)
go run .                  # http://localhost:8080
```

With `EMAIL_HUB_API_KEY` unset the server logs the submission and returns `200` — useful in dev.

Smoke test:

```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","type":"project","message":"Hello from curl"}'
```

## 3. Build

```bash
cd web && bun run build    # → web/dist
```

## 4. Deploy

```bash
./deploy.sh              # same as "site"
./deploy.sh site         # web/ → https://greentripai-ai.web.app
./deploy.sh api          # Go backend → Cloud Run
./deploy.sh all          # api + site
./deploy.sh triyambaka   # web-triyambaka/ → triyambaka site
./deploy.sh pro7ai       # web/ → legacy pro7 site
./deploy.sh status       # show what is live, diff Cloud Run env vs repo (no deploy)
```

The script checks prerequisites and gcloud auth, enables the required GCP APIs, verifies the Secret Manager secret before building, deploys, and health-checks `/health`. Override `PROJECT_ID`, `REGION`, `SERVICE`, `SECRET_NAME`, `SITE_ID` or `HOSTING_TARGET` via environment variables.

Editing `server/cloudrun.env.yaml` has no effect until you run `./deploy.sh api` — use `./deploy.sh status` to confirm the live revision matches the repo.

## 5. Pages

| Route | Description |
| --- | --- |
| `/` | Home |
| `/services` | Service offerings |
| `/solutions` | Solution blueprints |
| `/case-studies` | Case studies |
| `/about` | About + process |
| `/contact` | Contact form |
| `/gtdoc` | GTDoc — AI-powered dental clinic management app, with an email + phone early-access form |

## 6. Editing content

All copy lives in plain TypeScript — no CMS:

| Path | What |
| --- | --- |
| `web/src/pages/` | Route components and page copy |
| `web/src/components/` | Navbar, Footer, Hero, Section, Logo, ScrollToTop |
| `web/src/data/services.ts` | Services, solutions and case-study content |
| `web/index.html` | Title, meta description, Open Graph tags |
| `web/tailwind.config.js`, `web/src/index.css` | Design tokens and component classes |

Change the strings, rebuild, redeploy.

## 7. Theme

Dark theme built on the brand green `#aec479`, with a gold accent (`#e0b25a`), teal detail accent (`#5ec9b1`) and a warm near-black background (`#090b07`). Tokens are defined in `web/tailwind.config.js`; component classes such as `.btn-primary`, `.card` and `gradient-text` live in `web/src/index.css`.
