# Showcase

A full-stack supplements shop ("فیت مکمل") with a Persian, right-to-left storefront and an admin panel.

| Part | Stack | Default URL | Docs |
| --- | --- | --- | --- |
| [`frontend/`](frontend) | Next.js 15, React 19, Tailwind CSS 4 | http://localhost:3000 | [frontend/README.md](frontend/README.md) |
| [`backend/`](backend) | NestJS 11, GraphQL (Apollo Server 5), SQLite + Drizzle | http://localhost:4000/graphql | [backend/README.md](backend/README.md) |

The frontend talks to the backend over GraphQL; product images uploaded through the admin panel are served by the backend from `/uploads`.

## Features

- Product catalogue with categories, brands, flavors and a homepage slider
- Sign-up / login, shopping cart, orders
- Product reviews and ratings: 1–5 stars with text, likes/dislikes, and admin replies
- Admin panel for products, users, categories, brands, flavors, sliders and review moderation
- Light / dark theme, Persian UI

## Quick start

Requires Node.js 20+.

**1. Backend** (terminal 1)

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run start:dev
```

The SQLite database is created automatically in `backend/data/` on first start.

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

If you change the backend port or host, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` and update `images.remotePatterns` in `frontend/next.config.ts`.

## Repository layout

```
showcase/
├── backend/            # NestJS GraphQL API (+ SQLite data, uploads)
├── frontend/           # Next.js app
├── docker-compose.yml  # See "Docker" below
├── .env.example        # Legacy example — see "Configuration"
└── package.json        # Legacy — see "Known inconsistencies"
```

Each of `backend/` and `frontend/` has its own `package.json`; there is no workspace setup, so install dependencies inside each folder.

## Configuration

Real configuration lives in the sub-projects:

- Backend: `backend/.env` (from `backend/.env.example`) — `PORT`, `FRONTEND_URL`, `BACKEND_PUBLIC_URL`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`. The backend does not load `.env` itself, so set these in the process environment. `JWT_SECRET` is required in production.
- Frontend: `frontend/.env.local` — `NEXT_PUBLIC_API_URL`

See the sub-project READMEs for details.

## Tests

```bash
cd backend && npm test      # 28 tests: pricing, login tokens and permissions, reviews (in-memory database)
cd frontend && npm run lint # the frontend has no test suite
```

Before releasing, also run `npm run build` in both folders and start the production builds (`npm start`), because some errors only appear outside dev mode.

## Docker

`backend/Dockerfile` builds the API image. The root `docker-compose.yml` currently defines a PostgreSQL service and passes a Postgres `DATABASE_URL` to the backend, but the backend only supports a SQLite file path, so the compose setup does not work as written. Build and run the backend image directly (see [backend/README.md](backend/README.md#docker)) or update the compose file.

## Known inconsistencies

These predate this documentation and are noted so they don't surprise you:

- The root `.env.example` uses ports 5000/3001 and a `sqlite:` URL; the real defaults are 4000/3000 and a plain file path.
- Product titles are currently blank in the storefront because the frontend's GraphQL product fields omit `name` (see `frontend/CLAUDE.md`, Gotchas).
- The root `package.json` and `package-lock.json` list dependencies (TypeORM, pg, type-graphql, apollo-server-express 3) that neither app uses.
- `utputFormat` in the repo root is a saved HTTP error response, not project source.
- Backend authorization is incomplete (plaintext passwords, and unprotected admin mutations for products, users, categories, brands, flavors and sliders; cart, orders and reviews are protected) — **do not deploy publicly as-is**. Details in [backend/README.md](backend/README.md#security-notice--not-production-ready).

## Contributing notes

- Keep `frontend/app/lib/graphql.ts` in sync with the backend GraphQL schema when models change.
- UI copy is Persian; keep layouts RTL-safe.
- AI-assistant guidance for each half is in `backend/CLAUDE.md` and `frontend/CLAUDE.md`.
