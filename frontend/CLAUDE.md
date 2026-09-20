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

Dev mode does not enforce static-vs-dynamic rendering rules, so run `npm run build && npm start` before shipping a change to a server-rendered page (a route that passed in `dev` once returned HTTP 500 only in production; see Gotchas).

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
  products/             list page; products/[slug]/ detail page (force-dynamic; mounts <ProductReviews>)
  cart/, orders/        signed-in shopper pages (client components)
  auth/                 login, register (AppShell hides header/footer on /auth/*)
  admin/                dashboard + products, users, categories, brands, flavors, sliders CRUD,
                        comments/ (review moderation: tabs, reply, edit, delete)
  unauthorized/         target of AdminGuard redirect for non-admins
  providers/AuthProvider.tsx   auth context (token + user in localStorage)
  lib/
    graphql.ts          graphqlRequest<T>() + one typed function per query/mutation
    products.ts         shared TS types (Product, Cart, Order, AdminUser, Comment, ProductReviews, ...)
    auth.ts             signup/login/logout helpers
    config.ts           API URLs
    date.ts             formatDate() — Persian long date, used by the review UI and admin cards
    toast.ts            react-toastify wrappers (Persian, RTL, top-left)
  components/           shared UI; subfolders:
    admin/              DataGrid, ProductForm, UserForm, CommentCard, StatusBadge (ActiveBadge, CommentStatusBadge, Pill), ...
    auth/               login/register forms
    reviews/            ProductReviews (section container), ReviewForm, ReviewItem, StarRating
```

### Data layer

- All backend access goes through `graphqlRequest()` in `app/lib/graphql.ts` — a plain `fetch` POST with `cache: "no-store"`. There is no Apollo/urql client. It throws on HTTP errors and on GraphQL `errors`, so callers wrap it in try/catch and surface `errorMessage(err, fallback)` through `notifyError`.
- Queries are hand-written strings that share field fragments (`productFields`, `cartFields`, ...). When the backend model changes, update the fragment **and** the matching type in `lib/products.ts`.
- Numeric ids are `Float!` in the backend schema; the helpers convert with `Number(id)`. Keep that when adding mutations.
- The auth token is added automatically in the browser (`Authorization: Bearer <localStorage["auth-token"]>`). Server components fetching data get no token, so only public queries work there; cart/orders are fetched from client components.
- Prices are formatted strings from the API (e.g. `"1,250,000"`); display them as-is rather than parsing to numbers.
- Review functions: `getProductReviews`, `getAdminComments(status?)`, `createComment`, `voteComment`, `replyToComment`, `updateComment`, `removeComment`, all sharing one `commentFields` fragment. Ids go through `Number(id)` (the schema uses `Float!`). `voteComment` is a single toggle: the same type again removes the vote, the other type switches it.
- `Product.rating` / `reviewCount` are derived on the backend from reviews; they are read-only here (they are not in `ProductInput`, and `ProductForm` has no inputs for them).

### Auth and admin

- `AuthProvider`/`useAuth()` (`providers/AuthProvider.tsx`) keeps `auth-token` and `auth-user` in `localStorage` and exposes `login`, `setSession`, `logout`. Consume it only from `"use client"` components.
- `AdminGuard` wraps admin pages: no token -> `/auth/login` (which itself redirects to `/auth?mode=login`); `user.role !== "ADMIN"` -> `/unauthorized`. **This is a UI convenience only.** The backend enforces admin access for the comment operations (reply, edit, delete, `adminComments`) but not yet for product, user, category, brand, flavor or slider mutations, so never treat the guard as a security boundary.
- A stored token can go stale (expired, or issued before the backend started signing tokens). Requests then fail with "Invalid session." and the user must sign in again; there is no automatic logout on that error.
- Client components use `"use client"` explicitly; pages that fetch on the server (`page.tsx`, `products/*`) are async server components.

### UI conventions

- Tailwind 4 with design tokens declared in `app/globals.css` (`--background`, `--surface`, `--accent`, `--danger`, ...) exposed to utilities via `@theme inline` (`bg-surface`, `text-muted`, `border-border`, `text-accent`). Use the tokens, not raw hex colors.
- Light/dark theme: `ThemeToggle` persists `site-theme` in `localStorage`; `<html>`/`<body>` use `suppressHydrationWarning` for this reason. Render theme-dependent UI only after mount to avoid hydration mismatches.
- User-facing strings are Persian and hardcoded inline (no i18n library). Keep new copy in Persian and keep layouts RTL-safe (prefer logical properties/`start`/`end` over `left`/`right`; note `react-toastify` is configured `rtl`).
- Icons: `react-icons/fi`. Tables: `ag-grid-react` via `components/admin/DataGrid.tsx`. Carousels: `swiper` (`SliderHero`). Uploads: `react-filepond` posting to `UPLOAD_URL`.
- Stars: use `components/reviews/StarRating` for every rating (read-only with fractional fill, or an input when `onChange` is passed). Don't hand-build star rows. In RTL the first star is on the right and the input's arrow keys are mirrored.
- Reviews are fetched client-side by `ProductReviews` (it needs the viewer's token to get `myVote`), and the product header rating is server-rendered from `product.rating`; after a review is created the client calls `router.refresh()` to update it.
- Destructive admin actions confirm with `window.confirm`, matching the other admin pages. Notifications go through `lib/toast.ts`.
- Tailwind is 4.3: prefer the canonical class names (`wrap-break-word`, `bg-linear-to-br`), which the IDE flags.
- Static assets are in `public/` (`images/products`, `images/slider`, `fonts`). Product/slider image fields hold either `/images/...` paths served by Next or absolute `.../uploads/...` URLs from the backend.

## Gotchas

- `package.json` name is still the template's `my-app`.
- `@ag-grid-community/styles` is v32 while `ag-grid-community`/`ag-grid-react` are v36 — check DataGrid styling if you touch grid theming or upgrade.
- Data fetches use `cache: "no-store"`, so pages render per request; a backend outage shows up as a runtime error on the page, not a build failure.
- **Do not add `generateStaticParams` to `products/[slug]`.** Combined with the `no-store` fetch it made every product page return HTTP 500 (`DYNAMIC_SERVER_USAGE`) in production. The page exports `dynamic = "force-dynamic"` instead.
- **Keep `name`, `tagline`, `quantity` and `images` in `productFields`** (`lib/graphql.ts`). The backend computes them for `products`, `product(slug)` and cart items, and the UI reads them for card titles, the detail `<h1>`, the page title, image alt text, the header search (`product.name.toLowerCase()`) and the cart. Without them titles are blank and Next reports "Image is missing required alt". The product detail page also falls back to `persianName` through `productTitle()` for its title, heading and image alt, so it never renders "undefined"; other components should do the same if they show the name. `createProduct` / `updateProduct` return raw rows, so these four are `null` in those responses; don't rely on them after a save.
- An unknown product slug returns HTTP 500 instead of 404: `getProductBySlug` throws, so the page's `notFound()` is never reached.
- A user who already reviewed a product still sees the review form; submitting shows the backend's "already reviewed" message. Hiding the form needs an "is mine" flag on `Comment`.
- `next-env.d.ts` and `*.tsbuildinfo` are gitignored; don't commit them.
- The default `app/favicon.ico` and template SVGs in `public/` (`next.svg`, `vercel.svg`, ...) are unused leftovers.
