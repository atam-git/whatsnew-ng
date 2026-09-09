# Whatsnew.ng — Frontend

Next.js 15 (App Router) · React 19 · Tailwind v4 · TypeScript.

**One app, two faces**, split by route group:

| Route group | URL | What it is |
|---|---|---|
| `src/app/(business)` | `/`, `/hotels`, `/reads/:slug`, `/contact`, … | the public site |
| `src/app/(cms)` | `/cms`, `/cms/content/:type`, `/cms/newsletter`, … | the admin CMS UI |

Both consume the NestJS API (`../backend`). No database or business logic here.

## Layout

```
src/
├── middleware.ts               gates /cms/* (redirects to /cms/login without a cookie)
├── app/
│   ├── layout.tsx              root <html>; global metadata
│   ├── not-found.tsx
│   ├── (business)/
│   │   ├── layout.tsx          site header + footer, skip-link
│   │   ├── page.tsx            homepage — renders CMS-curated shelves
│   │   ├── [section]/
│   │   │   ├── page.tsx        /hotels… = content listing · /about… = CMS Page
│   │   │   └── [slug]/page.tsx content detail (+ generateMetadata)
│   │   ├── contact/  subscribe/  submit/    public forms (honeypot + rate-limited API)
│   └── (cms)/cms/
│       ├── layout.tsx          bare wrapper (login renders here, no auth)
│       ├── login/page.tsx
│       └── (app)/              auth-gated; layout resolves the session + role
│           ├── layout.tsx      <CmsShell> sidebar + topbar
│           ├── page.tsx        dashboard
│           ├── content/[type]/ per-type list (New/edit forms: TODO)
│           ├── homepage/  media/  newsletter/  submissions/
├── components/
│   ├── ui/                     design-system primitives (Button, …)
│   ├── business/               public-site components (SiteHeader, ContentCard, Shelf)
│   └── cms/                    admin components (CmsShell, SignOutButton)
├── lib/
│   ├── env.ts                  NEXT_PUBLIC_* config
│   ├── api/
│   │   ├── client.ts           one fetch wrapper (browser + server, cookie forwarding)
│   │   ├── content.ts          typed endpoint helpers + ContentType→path map
│   │   ├── types.ts            hand-written API types (until schema.d.ts is generated)
│   │   └── schema.d.ts         generated from backend OpenAPI (gitignored)
│   ├── auth/session.ts         getSession() — reads /auth/me with request cookies
│   └── utils/                  cn(), date formatting
└── styles/globals.css          Tailwind v4 @theme tokens (neutral placeholder palette)
```

## Auth model

- Admin logs in at `/cms/login` → backend sets httpOnly `wn_access` / `wn_refresh` cookies.
- `middleware.ts` blocks `/cms/*` without the cookie.
- `(cms)/cms/(app)/layout.tsx` calls `getSession()` server-side for the real role check.
- Browser calls hit `/api/*` and are rewritten to the backend (`next.config.ts`) so
  cookies stay same-origin.

## Getting started

```bash
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL to the backend
npm install
npm run dev                    # http://localhost:3000  (CMS at /cms)
```

With the backend running you can regenerate typed API bindings:

```bash
npm run api:types              # reads ../backend/openapi.json → src/lib/api/schema.d.ts
```

## Not built yet (next steps)

- Content create/edit forms (react-hook-form + zod) with a Tiptap editor for `body`.
- Tiptap JSON → HTML renderer shared by public detail pages and CMS Pages.
- Homepage curation drag-and-drop; media library grid + uploader.
- Design pass — visual direction (which prototype / new) is still an open question;
  current styling is a neutral placeholder.
