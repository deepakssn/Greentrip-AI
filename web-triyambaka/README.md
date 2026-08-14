# web-triyambaka — legacy brand clone

React 19 + Vite 8 + TypeScript + TailwindCSS, built with **Bun**. Source for the legacy Triyambaka site (`triyambaka` Hosting target → https://triyambaka.web.app).

This is a 1:1 clone of [`../web`](../web) with different brand strings. The active brand is **GreentripAI** — change this app only to keep it in lockstep, or when a Triyambaka-specific deviation is intentional.

See [`../AGENTS.md`](../AGENTS.md) for architecture and the deployment runbook.

## Scripts

```bash
bun install
bun run dev       # http://localhost:5173 (run only one site at a time, or change the port)
bun run build     # tsc -b && vite build → dist/
bun run preview
bun run lint
```

## Differences from `web/`

- No `/gtdoc` page — routes are `/`, `/services`, `/solutions`, `/case-studies`, `/about`, `/contact`, `*`.
- Deploys to the `triyambaka` target (`./deploy.sh triyambaka`).

Everything else — components, design tokens, `index.css`, the contact form contract — is intended to match `web/` exactly. It shares the same backend (`/api/contact` rewritten to the same Cloud Run service) and the same brand green `#aec479` theme.
