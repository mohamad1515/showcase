# Showcase — Backend

GraphQL API for the Showcase supplements shop, built with **NestJS 11**, **Apollo Server 5** (code-first schema), and **SQLite** (`better-sqlite3` + Drizzle ORM).

## Features

- Products, categories, brands, flavors and homepage sliders (CRUD)
- User accounts with `USER` / `ADMIN` roles, signup and login
- Per-user shopping cart and order creation from the cart
- Product reviews: 1–5 star ratings with text, likes/dislikes, and one admin reply per review, with an Unanswered/Answered status
- Signed, expiring login tokens and role checks done on the server for the cart, orders and reviews
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
| `JWT_SECRET` | insecure dev fallback | Secret used to sign login tokens. **Required when `NODE_ENV=production`**: the server refuses to start without it |
| `JWT_EXPIRY` | `24h` | Token lifetime: a number followed by `s`, `m`, `h` or `d` |
| `OAUTH_*` | — | Documented in `.env.example` but not yet read by the code |

The backend does not read `.env` files itself: set these variables in the environment that starts the process (shell, Docker `-e`, your host's settings). Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Changing `JWT_SECRET` signs everyone out.

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start with watch mode |
| `npm start` | Start once (Nest compiles on start) |
| `npm run build` | Compile to `dist/` |
| `npm test` | Run the tests (`node:test` via `tsx`): pricing, login tokens/permissions, and reviews, against an in-memory database |
| `npm run db:seed` | Create empty `products`/`flavors` tables (products are not seeded) |
| `npm run lint` | ESLint over `src/` (needs an ESLint 9 config — none is committed yet) |

## Project structure

```
src/
├── main.ts               # Bootstrap: CORS, static assets, listen
├── app.module.ts         # GraphQL config + feature modules
├── db/                   # SQLite connection, table creation, seeding, Drizzle schema
├── auth/                 # signup / login, SessionService (tokens + access checks), OAuth2 strategy (placeholder)
├── user/                 # User entity and admin user management
├── products/             # Product catalogue
├── categories/           # Categories
├── brands/  flavors/     # Lookup lists used by products
├── sliders/              # Homepage hero slides
├── comments/             # Product reviews: comments, admin replies, votes
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
| Reviews | `productReviews(productSlug)`, `adminComments(status)` | `createComment`, `voteComment`, `replyToComment`, `updateComment`, `removeComment` |

Send `Authorization: Bearer <token>` (the token comes from `login`) for cart, orders and reviews. Who may call what:

| Operation | Who |
| --- | --- |
| `productReviews` | Anyone (`myVote` is included only when a valid token is sent) |
| `createComment`, `voteComment` | Any signed-in user, including admins |
| `replyToComment`, `updateComment`, `removeComment`, `adminComments` | Admins only (403 for other users, 401 without a session) |

A review's author is always the token's user. `voteComment` is one toggle: sending the same vote again removes it, and the other type switches it. Each admin reply moves its review from `UNANSWERED` to `ANSWERED`.

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

```graphql
# with the Authorization header set
mutation {
  createComment(input: { productSlug: "gold-whey", rating: 5, content: "Great taste" }) {
    id
    userName
    status
  }
}

query {
  productReviews(productSlug: "gold-whey") {
    average
    count
    distribution          # reviews per star: [1★, 2★, 3★, 4★, 5★]
    comments { id userName rating content likeCount dislikeCount myVote reply { adminName content } }
  }
}
```

## Database

- Stored at `DATABASE_URL` (default `backend/data/showcase.sqlite`, git-ignored), in WAL mode.
- On every start the app creates missing tables, adds missing columns, and inserts default data with `INSERT OR IGNORE`: an admin user (see `DatabaseService.seed()` in `src/db/database.service.ts`), two categories, and one slider.
- There is no migration tool. Schema changes are made in both `src/db/schema.ts` (Drizzle) and `src/db/database.service.ts` (DDL / `ensureColumn`).
- Prices are stored as formatted strings such as `"1,250,000"`.
- Reviews live in `comments`, `replies` and `comment_votes` (one review per user per product, one admin reply per review, one vote per user per review). Deleting a review removes its reply and votes; deleting a product removes its reviews.
- A product's `rating` (average, one decimal) and `review_count` are calculated from its reviews whenever one is created or deleted. They are not editable through the product API.
- To reset, stop the server and delete the `data/` folder.

## Docker

```bash
docker build -t showcase-backend .
docker run -p 4000:4000 \
  -e NODE_ENV=production -e JWT_SECRET="<a long random string>" \
  -v showcase-data:/app/data -v showcase-uploads:/app/public/uploads \
  showcase-backend
```

The Dockerfile does not set `NODE_ENV`, so pass it (as above) to make the container refuse to start without a `JWT_SECRET`; otherwise it would silently sign tokens with the public development secret.

The root `docker-compose.yml` still defines a PostgreSQL service and a Postgres-style `DATABASE_URL`; the backend only supports SQLite, so use the plain `docker run` above (or fix the compose file) until that is reconciled.

## Security notice — not production ready

This project is a work in progress. Before exposing it publicly, note that:

- Cart, order and review operations are protected (signed tokens, roles checked on the server), but GraphQL mutations for products, categories, brands, flavors, sliders and users, and the `users` query, are **still not access-controlled**.
- Passwords are stored and compared in plaintext, and the `User` type exposes the password field.
- `/upload` accepts any file without authentication or limits.
- A default admin account is seeded with credentials hardcoded in the source.
- Set a strong `JWT_SECRET`; without it non-production runs use a public development secret.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `EADDRINUSE` on port 4000 | Set a different `PORT` (and update `NEXT_PUBLIC_API_URL` in the frontend) |
| CORS errors in the browser | Set `FRONTEND_URL` to the exact frontend origin |
| `better-sqlite3` binding errors after changing Node version | `npm rebuild better-sqlite3` |
| "Could not locate the bindings file" after installing with pnpm | pnpm skips install scripts: run `pnpm approve-builds`, or use npm |
| "Invalid session." on cart/review calls | The stored token is expired, predates signed tokens, or `JWT_SECRET` changed: sign in again |
| Server exits with "JWT_SECRET must be set" | `NODE_ENV=production` requires `JWT_SECRET` in the process environment |
| Uploaded images don't render in the frontend | Add the backend host to `images.remotePatterns` in `frontend/next.config.ts` |
| `/graphiql` returns 404 | The controller isn't registered; use `/graphql` |

See the [frontend README](../frontend/README.md) and the [root README](../README.md) for the full-stack setup.
