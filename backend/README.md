# Showcase — Backend

GraphQL API for the Showcase supplements shop, built with **NestJS 11**, **Apollo Server 5** (code-first schema), and **SQLite** (`better-sqlite3` + Drizzle ORM).

## Features

- Products, categories, brands, flavors and homepage sliders (CRUD)
- User accounts with `USER` / `ADMIN` roles, signup and login
- Per-user shopping cart and order creation from the cart
- Image upload endpoint (`POST /upload`) with static file serving
- Zero-setup database: the SQLite file and all tables are created on first start

## Requirements

- Node.js 20+
- A C++ toolchain only if `better-sqlite3` has no prebuilt binary for your platform

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run start:dev
```

The server listens on **http://localhost:4000** by default:

| URL | What |
| --- | --- |
| `http://localhost:4000/graphql` | GraphQL endpoint (Apollo landing page in non-production) |
| `http://localhost:4000/upload` | `POST` multipart upload, field name `file` |
| `http://localhost:4000/uploads/<file>` | Uploaded files |

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin (credentials enabled) |
| `BACKEND_PUBLIC_URL` | `http://localhost:$PORT` | Public base URL used in upload responses and startup logs |
| `DATABASE_URL` | `./data/showcase.sqlite` | **Filesystem path** to the SQLite file (not a connection URL) |
| `OAUTH_*` | — | Documented in `.env.example` but not yet read by the code |

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start with watch mode |
| `npm start` | Start once (Nest compiles on start) |
| `npm run build` | Compile to `dist/` |
| `npm test` | Run unit tests (`node:test` via `tsx`) |
| `npm run db:seed` | Create empty `products`/`flavors` tables (products are not seeded) |
| `npm run lint` | ESLint over `src/` (needs an ESLint 9 config — none is committed yet) |

## Project structure

```
src/
├── main.ts               # Bootstrap: CORS, static assets, listen
├── app.module.ts         # GraphQL config + feature modules
├── db/                   # SQLite connection, table creation, seeding, Drizzle schema
├── auth/                 # signup / login, OAuth2 strategy (placeholder)
├── user/                 # User entity and admin user management
├── products/             # Product catalogue
├── categories/           # Categories
├── brands/  flavors/     # Lookup lists used by products
├── sliders/              # Homepage hero slides
├── shop/                 # Cart, orders, price helpers (+ unit test)
└── upload/               # File upload controller
```

Each domain follows the same layout: `*.model.ts` (GraphQL type), `*.input.ts` (inputs), `*.service.ts` (logic + DB), `*.resolver.ts`, `*.module.ts`.

## API overview

Everything is served from `POST /graphql`.

| Area | Queries | Mutations |
| --- | --- | --- |
| Products | `products(category)`, `product(slug)` | `createProduct`, `updateProduct`, `removeProduct` |
| Categories | `categories`, `category(slug)` | `createCategory`, `updateCategory`, `removeCategory` |
| Brands / Flavors | `brands`, `flavors` | `create*`, `update*`, `remove*` |
| Sliders | `sliders`, `slider(id)` | `createSlider`, `updateSlider`, `removeSlider` |
| Users | `users`, `user(id)` | `createUser`, `updateUser`, `setUserActive` |
| Auth | — | `signup`, `login` |
| Cart & orders | `myCart`, `myOrders` | `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`, `createOrderFromCart` |

Cart and order operations require an `Authorization: Bearer <token>` header, where the token comes from `login`.

Example:

```graphql
query {
  products(category: "sports-supplements") {
    slug
    persianName
    englishName
    price
    stock
  }
}
```

```graphql
mutation {
  login(input: { email: "user@example.com", password: "secret" }) {
    token
    user { id name role }
  }
}
```

## Database

- Stored at `DATABASE_URL` (default `backend/data/showcase.sqlite`, git-ignored), in WAL mode.
- On every start the app creates missing tables, adds missing columns, and inserts default data with `INSERT OR IGNORE`: an admin user (see `DatabaseService.seed()` in `src/db/database.service.ts`), two categories, and one slider.
- There is no migration tool. Schema changes are made in both `src/db/schema.ts` (Drizzle) and `src/db/database.service.ts` (DDL / `ensureColumn`).
- Prices are stored as formatted strings such as `"1,250,000"`.
- To reset, stop the server and delete the `data/` folder.

## Docker

```bash
docker build -t showcase-backend .
docker run -p 4000:4000 -v showcase-data:/app/data -v showcase-uploads:/app/public/uploads showcase-backend
```

The root `docker-compose.yml` still defines a PostgreSQL service and a Postgres-style `DATABASE_URL`; the backend only supports SQLite, so use the plain `docker run` above (or fix the compose file) until that is reconciled.

## Security notice — not production ready

This project is a work in progress. Before exposing it publicly, note that:

- GraphQL mutations for products, categories, users, etc. are **not access-controlled**; only cart/order operations check for a token.
- Login tokens are unsigned base64 strings, not JWTs.
- Passwords are stored and compared in plaintext.
- `/upload` accepts any file without authentication or limits.
- A default admin account is seeded with credentials hardcoded in the source.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `EADDRINUSE` on port 4000 | Set a different `PORT` (and update `NEXT_PUBLIC_API_URL` in the frontend) |
| CORS errors in the browser | Set `FRONTEND_URL` to the exact frontend origin |
| `better-sqlite3` binding errors after changing Node version | `npm rebuild better-sqlite3` |
| Uploaded images don't render in the frontend | Add the backend host to `images.remotePatterns` in `frontend/next.config.ts` |
| `/graphiql` returns 404 | The controller isn't registered; use `/graphql` |

See the [frontend README](../frontend/README.md) and the [root README](../README.md) for the full-stack setup.
