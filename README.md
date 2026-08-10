# Pro7AI.com

Ultra-modern marketing site for **Pro7AI** — an applied AI consulting brand.

- **Frontend**: React + Vite + TypeScript + TailwindCSS + framer-motion (built with Bun)
- **Backend**: Go HTTP service on Google Cloud Run, sending mail via the [Resend](https://resend.com) API
- **Hosting**: Firebase Hosting (static frontend) with `/api/**` rewrites to Cloud Run
- **Contact email**: `support@pro7ai.com`

```
.
├── web/        # Vite + React frontend
├── server/     # Go Cloud Run backend (POST /api/contact)
├── firebase.json
└── .firebaserc
```

## 1. Prerequisites

- [Bun](https://bun.sh) `>= 1.3`
- [Go](https://go.dev/dl/) `>= 1.25`
- [Firebase CLI](https://firebase.google.com/docs/cli) `>= 13`
- [`gcloud`](https://cloud.google.com/sdk/docs/install) CLI authenticated against your GCP project
- A [Resend](https://resend.com) API key with `pro7ai.com` verified as a sending domain

## 2. Local development

### Frontend

```bash
cd web
bun install
bun run dev
# → http://localhost:5173
```

`vite.config.ts` proxies `/api/*` to `http://localhost:8080`, so the contact form
talks to the Go backend transparently.

### Backend

```bash
cd server
cp .env.example .env        # then edit .env with your real Resend key
export $(grep -v '^#' .env | xargs)
go run .
# → http://localhost:8080
```

If `RESEND_API_KEY` is empty, the server logs the submission and returns 200 — useful in dev.

Smoke test the API:

```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","type":"project","message":"Hello from curl"}'
```

## 3. Production build

```bash
cd web && bun run build      # outputs web/dist
```

## 4. Deploy the backend to Cloud Run

```bash
cd server
gcloud config set project pro7ai
gcloud run deploy pro7ai-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "CONTACT_FROM=Pro7AI Website <noreply@pro7ai.com>,CONTACT_TO=support@pro7ai.com,ALLOWED_ORIGINS=https://pro7ai.com,https://www.pro7ai.com" \
  --set-secrets "RESEND_API_KEY=RESEND_API_KEY:latest"
```

Create the secret first if needed:

```bash
echo -n "re_your_real_key" | gcloud secrets create RESEND_API_KEY --data-file=-
gcloud secrets add-iam-policy-binding RESEND_API_KEY \
  --member "serviceAccount:$(gcloud projects describe pro7ai --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role roles/secretmanager.secretAccessor
```

## 5. Deploy the frontend to Firebase Hosting

```bash
firebase login
firebase use pro7ai
cd web && bun run build && cd ..
firebase deploy --only hosting
```

`firebase.json` rewrites `/api/**` directly to the `pro7ai-api` Cloud Run service in `us-central1`, so the frontend can call `/api/contact` with no CORS round-trip.

## 6. Domain

Add `pro7ai.com` and `www.pro7ai.com` as custom domains in Firebase Hosting and update DNS as instructed by the console.

## 7. Project structure

| Path                          | What                                            |
| ----------------------------- | ----------------------------------------------- |
| `web/src/pages/`              | Route components (Home, Services, etc.)         |
| `web/src/components/`         | Reusable UI (Navbar, Footer, Hero, Section…)    |
| `web/src/data/services.ts`    | Content for services / solutions / case studies |
| `server/main.go`              | Cloud Run service + `/api/contact` handler      |
| `server/Dockerfile`           | Distroless production image                     |
| `firebase.json` / `.firebaserc` | Hosting + Cloud Run rewrites                  |

## 8. Editing content

All marketing copy lives in plain TypeScript files under `web/src/pages/` and
`web/src/data/services.ts` — no CMS required. Change the strings, rebuild,
redeploy.
