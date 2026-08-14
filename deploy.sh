#!/usr/bin/env bash
#
# Deploy the GreentripAI stack to Google Cloud.
#
#   GCP / Firebase project : email-hub-service
#   Frontend               : Firebase Hosting site "greentripai-ai"
#                            → https://greentripai-ai.web.app
#   Backend                : Cloud Run service "pro7ai-api" (us-central1)
#                            reached from the site via the /api/** rewrite
#
# Usage:
#   ./deploy.sh              # same as "site"
#   ./deploy.sh site         # build web/ → https://greentripai-ai.web.app
#   ./deploy.sh api          # build + deploy the Go contact API to Cloud Run
#   ./deploy.sh all          # api + site
#   ./deploy.sh triyambaka   # legacy: web-triyambaka/ → triyambaka.web.app
#   ./deploy.sh pro7ai       # legacy: web/ → pro7.web.app
#   ./deploy.sh status       # show what is currently live (no deploy)
#
# Env overrides:
#   PROJECT_ID  REGION  SERVICE  SECRET_NAME  SITE_ID  HOSTING_TARGET
#   SKIP_API_ENABLE=1   skip the idempotent "gcloud services enable" step
#
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-email-hub-service}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-pro7ai-api}"
SECRET_NAME="${SECRET_NAME:-EMAIL_HUB_API_KEY}"

# Firebase Hosting site that serves the GreentripAI app. The site ID is
# "greentripai-ai" because plain "greentripai" is reserved by another project;
# HOSTING_TARGET is the alias declared in .firebaserc.
SITE_ID="${SITE_ID:-greentripai-ai}"
HOSTING_TARGET="${HOSTING_TARGET:-greentripai}"
SITE_URL="https://${SITE_ID}.web.app"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

require() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' is not installed or not on PATH."
}

preflight() {
  require gcloud
  require firebase
  require bun
  gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | grep -q . \
    || die "No active gcloud account. Run: gcloud auth login"
  gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1 \
    || die "Cannot access GCP project '$PROJECT_ID'. Check the name and your permissions."
}

# Required GCP services for a --source Cloud Run deploy (build + registry + run).
enable_apis() {
  [ -n "${SKIP_API_ENABLE:-}" ] && { info "Skipping API enable step."; return 0; }
  log "Ensuring required GCP APIs are enabled"
  gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    --project "$PROJECT_ID" >/dev/null
  info "run, cloudbuild, artifactregistry, secretmanager"
}

deploy_api() {
  [ -f server/cloudrun.env.yaml ] || die "server/cloudrun.env.yaml not found."
  enable_apis

  gcloud secrets describe "$SECRET_NAME" --project "$PROJECT_ID" >/dev/null 2>&1 \
    || die "Secret '$SECRET_NAME' not found in $PROJECT_ID. Create it first:
    printf 'KEY' | gcloud secrets create $SECRET_NAME --data-file=- --project $PROJECT_ID"

  log "Deploying Cloud Run service '$SERVICE' → $PROJECT_ID / $REGION"
  info "env from server/cloudrun.env.yaml, secret ${SECRET_NAME}:latest"
  ( cd server && gcloud run deploy "$SERVICE" \
      --source . \
      --region "$REGION" \
      --project "$PROJECT_ID" \
      --allow-unauthenticated \
      --env-vars-file cloudrun.env.yaml \
      --set-secrets "EMAIL_HUB_API_KEY=${SECRET_NAME}:latest" \
      --memory 256Mi \
      --cpu 1 \
      --max-instances 5 \
      --timeout 30s )

  local url
  url="$(gcloud run services describe "$SERVICE" \
    --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')"
  # Use /health, not /healthz — Cloud Run's frontend intercepts /healthz.
  log "Health check ${url}/health"
  if curl -fsS --max-time 20 "${url}/health" >/dev/null; then
    info "ok"
  else
    warn "Health check failed — inspect logs:"
    info "gcloud run services logs tail $SERVICE --region $REGION --project $PROJECT_ID"
  fi
}

# Make sure the Hosting target alias resolves to a real site. Idempotent, so a
# fresh clone or CI runner works without manual "firebase target:apply".
ensure_hosting_target() {
  local target="$1" site="$2"
  if firebase target --project "$PROJECT_ID" 2>/dev/null | grep -q "$site"; then
    return 0
  fi
  log "Mapping Hosting target '$target' → site '$site'"
  firebase target:apply hosting "$target" "$site" --project "$PROJECT_ID" >/dev/null \
    || die "Could not map target '$target' to site '$site'. Does the site exist?
    firebase hosting:sites:list --project $PROJECT_ID"
}

# build_and_deploy_site <hosting-target> <source-dir> <site-id>
build_and_deploy_site() {
  local target="$1" dir="$2" site="$3"
  [ -d "$dir" ] || die "Directory '$dir' not found."

  ensure_hosting_target "$target" "$site"

  log "Building $dir"
  ( cd "$dir" && { bun install --frozen-lockfile 2>/dev/null || bun install; } && bun run build )
  [ -f "$dir/dist/index.html" ] || die "Build produced no $dir/dist/index.html."

  log "Deploying $dir/dist → Hosting site '$site'"
  firebase deploy --only "hosting:${target}" --project "$PROJECT_ID"
  info "Live: https://${site}.web.app"
}

status() {
  log "Project $PROJECT_ID"

  info "Hosting sites:"
  firebase hosting:sites:list --project "$PROJECT_ID" 2>/dev/null \
    | grep -E 'web\.app' || info "  (none / unable to list)"

  info ""
  info "Cloud Run service '$SERVICE':"
  if gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" \
       --format='value(status.url)' 2>/dev/null | grep -q .; then
    gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" \
      --format='value[separator="  "](status.url,status.latestReadyRevisionName)' \
      | sed 's/^/      /'
    info ""
    info "Live env (CONTACT_TO / ALLOWED_ORIGINS):"
    gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" \
      --format='value(spec.template.spec.containers[0].env)' \
      | tr ';' '\n' | grep -E 'CONTACT_TO|ALLOWED_ORIGINS' | sed 's/^/      /' || true
    info ""
    info "Repo env (server/cloudrun.env.yaml):"
    grep -E 'CONTACT_TO|ALLOWED_ORIGINS' server/cloudrun.env.yaml | sed 's/^/      /'
    info ""
    info "If these differ, run: ./deploy.sh api"
  else
    info "  not deployed"
  fi
}

usage() {
  cat <<EOF
Usage: ./deploy.sh [target]

Targets:
  site         Build web/ and deploy to ${SITE_URL}   (default)
  api          Build + deploy the Go contact API to Cloud Run ($SERVICE)
  all          api, then site
  triyambaka   Legacy: build web-triyambaka/ → https://triyambaka.web.app
  pro7ai       Legacy: build web/ → https://pro7.web.app
  status       Show what is live and flag Cloud Run env drift (no deploy)

Project: $PROJECT_ID   Region: $REGION   Hosting site: $SITE_ID
EOF
}

main() {
  local target="${1:-site}"

  case "$target" in
    -h|--help|help) usage; exit 0 ;;
  esac

  preflight

  case "$target" in
    site|web|greentripai) build_and_deploy_site "$HOSTING_TARGET" web "$SITE_ID" ;;
    api|server)           deploy_api ;;
    all)                  deploy_api; build_and_deploy_site "$HOSTING_TARGET" web "$SITE_ID" ;;
    triyambaka)           build_and_deploy_site triyambaka web-triyambaka triyambaka ;;
    pro7ai|pro7)          build_and_deploy_site pro7ai web pro7 ;;
    status)               status; exit 0 ;;
    *)                    usage; die "Unknown target: $target" ;;
  esac

  log "Done."
}

main "$@"
