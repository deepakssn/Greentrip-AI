# web — GreentripAI frontend

React 19 + Vite 8 + TypeScript + TailwindCSS, built with **Bun**. This is the source for the live GreentripAI site (`greentripai` Hosting target) and also for the legacy `pro7ai` target.

See [`../AGENTS.md`](../AGENTS.md) for architecture and the deployment runbook.

## Scripts

```bash
bun install
bun run dev       # http://localhost:5173
bun run build     # tsc -b && vite build → dist/
bun run preview   # serve the production build
bun run lint      # eslint
```

`vite.config.ts` proxies `/api/*` to `http://localhost:8080`, so the contact and GTDoc forms hit a locally running `server/` with no CORS setup.

## Environment

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | Leave **empty** in production — Firebase Hosting rewrites `/api/**` to Cloud Run. Set it only if you need to call the Cloud Run URL directly. |

Copy `.env.example` to `.env` to override locally.

## Layout

```
src/
├── App.tsx              # routes
├── main.tsx             # BrowserRouter entry
├── index.css            # Tailwind layers + component classes
├── components/          # Navbar, Footer, Hero, Section, Logo, ScrollToTop
├── data/services.ts     # services / solutions / cases content
└── pages/               # Home, Services, Solutions, About,
                         # CaseStudies, Contact, GTDoc, NotFound
public/gt-logo.png       # brand mark rendered by Logo.tsx
```

## Routes

`/` · `/services` · `/solutions` · `/case-studies` · `/about` · `/contact` · `/gtdoc` · `*` (NotFound)

`/gtdoc` is the GTDoc dental-clinic product page; its early-access form collects email + phone and posts to the shared `/api/contact` endpoint.

## Theme

Design tokens live in `tailwind.config.js`:

- `brand.400` `#aec479` — primary green (`500`/`600` are the deeper shades used for buttons and glows)
- `accent.cyan` `#5ec9b1` — teal detail accent
- `accent.violet` `#e0b25a` — warm gold accent
- `ink.*` — warm near-black surfaces, page background `#090b07`

`accent.cyan` and `accent.violet` are historical key names — the hues no longer match the names. Recolor the token instead of renaming the key.

Component classes (`src/index.css`): `.btn-primary`, `.btn-ghost`, `.card`, `.chip`, `.input`, `.label`, `.glass`, `.gradient-border`, `.grid-bg`, `gradient-text`.

## Conventions

- Bun only — do not commit `package-lock.json` or `pnpm-lock.yaml`.
- Keep `lucide-react` on the `0.x` line; `1.x` has incompatible exports.
- Marketing copy stays in TypeScript files. No CMS, no runtime content fetching.
