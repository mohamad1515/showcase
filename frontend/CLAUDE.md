# CLAUDE.md — frontend

Next.js 15 (App Router, Turbopack) + React 19 + Tailwind CSS 4 storefront and admin panel for a Persian-language supplements shop. The UI is **RTL, Persian (`lang="fa" dir="rtl"`)**, using the bundled Vazir font. Talks to `../backend` over GraphQL.

## Commands

Run from `frontend/`. Both `package-lock.json` and `pnpm-lock.yaml` exist; pick one package manager and don't mix.

```bash
npm install
npm run dev      # next dev --turbopack   -> http://localhost:3000
npm run build    # next build --turbopack
npm start        # next start
npm run lint     # eslint (next/core-web-vitals + next/typescript, flat config)
```

There is no test setup. The backend must be running for almost every page to render (server components fetch at request time), so start `../backend` first.

## Configuration

`app/lib/config.ts` is the only place env vars are read:

- `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`, trailing slash stripped) -> `API_URL`, `GRAPHQL_URL` (`/graphql`), `UPLOAD_URL` (`/upload`).

Put it in `frontend/.env.local` (`.env*` is gitignored). The root `.env.example` suggests port 5000; the backend's real default is 4000.

`next.config.ts` allows `next/image` remote images only from `http://localhost:4000/uploads/**`. If the backend host/port changes (or in production), add a matching `images.remotePatterns` entry or uploaded images will fail to load.

## Structure

Everything lives under `app/` (there is no `src/`). The `@/*` path alias maps to the frontend root (e.g. `@/app/components/...`); the code mixes it with relative imports, so match the file you're editing.

```
app/
  layout.tsx            html shell (fa/rtl), AuthProvider, AppShell, ToastContainer
  page.tsx              home: SliderHero + ProductShowcase (server component)
  products/             list page; products/[slug]/ detail page
  cart/, orders/        signed-in shopper pages (client components)
  auth/                 login, register (AppShell hides header/footer on /auth/*)
  admin/                dashboard + products, users, categories, brands, flavors, sliders CRUD
  unauthorized/         target of AdminGuard redirect for non-admins
  providers/AuthProvider.tsx   auth context (token + user in localStorage)
  lib/
    graphql.ts          graphqlRequest<T>() + one typed function per query/mutation
    products.ts         shared TS types (Product, Cart, Order, AdminUser, ...)
    auth.ts             signup/login/logout helpers
    config.ts           API URLs
    toast.ts            react-toastify wrappers (Persian, RTL, top-left)
  components/           shared UI; admin/ (DataGrid, ProductForm, UserForm, ...) and auth/ subfolders
```

### Data layer

- All backend access goes through `graphqlRequest()` in `app/lib/graphql.ts` — a plain `fetch` POST with `cache: "no-store"`. There is no Apollo/urql client. It throws on HTTP errors and on GraphQL `errors`, so callers wrap it in try/catch and surface `errorMessage(err, fallback)` through `notifyError`.
- Queries are hand-written strings that share field fragments (`productFields`, `cartFields`, ...). When the backend model changes, update the fragment **and** the matching type in `lib/products.ts`.
- Numeric ids are `Float!` in the backend schema; the helpers convert with `Number(id)`. Keep that when adding mutations.
- The auth token is added automatically in the browser (`Authorization: Bearer <localStorage["auth-token"]>`). Server components fetching data get no token, so only public queries work there; cart/orders are fetched from client components.
- Prices are formatted strings from the API (e.g. `"1,250,000"`); display them as-is rather than parsing to numbers.

### Auth and admin

- `AuthProvider`/`useAuth()` (`providers/AuthProvider.tsx`) keeps `auth-token` and `auth-user` in `localStorage` and exposes `login`, `setSession`, `logout`. Consume it only from `"use client"` components.
- `AdminGuard` wraps admin pages: no token -> `/auth/login`; `user.role !== "ADMIN"` -> `/unauthorized`. **This is a UI convenience only.** The backend does not currently authorize admin mutations, so never treat the guard as a security boundary or assume server-side enforcement.
- Client components use `"use client"` explicitly; pages that fetch on the server (`page.tsx`, `products/*`) are async server components.

### UI conventions

- Tailwind 4 with design tokens declared in `app/globals.css` (`--background`, `--surface`, `--accent`, `--danger`, ...) exposed to utilities via `@theme inline` (`bg-surface`, `text-muted`, `border-border`, `text-accent`). Use the tokens, not raw hex colors.
- Light/dark theme: `ThemeToggle` persists `site-theme` in `localStorage`; `<html>`/`<body>` use `suppressHydrationWarning` for this reason. Render theme-dependent UI only after mount to avoid hydration mismatches.
- User-facing strings are Persian and hardcoded inline (no i18n library). Keep new copy in Persian and keep layouts RTL-safe (prefer logical properties/`start`/`end` over `left`/`right`; note `react-toastify` is configured `rtl`).
- Icons: `react-icons/fi`. Tables: `ag-grid-react` via `components/admin/DataGrid.tsx`. Carousels: `swiper` (`SliderHero`). Uploads: `react-filepond` posting to `UPLOAD_URL`.
- Static assets are in `public/` (`images/products`, `images/slider`, `fonts`). Product/slider image fields hold either `/images/...` paths served by Next or absolute `.../uploads/...` URLs from the backend.

## Gotchas

- `package.json` name is still the template's `my-app`.
- `@ag-grid-community/styles` is v32 while `ag-grid-community`/`ag-grid-react` are v36 — check DataGrid styling if you touch grid theming or upgrade.
- Data fetches use `cache: "no-store"`, so pages render per request; a backend outage shows up as a runtime error on the page, not a build failure.
- `next-env.d.ts` and `*.tsbuildinfo` are gitignored; don't commit them.
- The default `app/favicon.ico` and template SVGs in `public/` (`next.svg`, `vercel.svg`, ...) are unused leftovers.
