# Showcase — Frontend

Storefront and admin panel for the Showcase supplements shop. Built with **Next.js 15** (App Router), **React 19** and **Tailwind CSS 4**. The interface is **Persian (fa) and right-to-left**, using the bundled Vazir font.

## Features

- Home page with a hero slider and product showcase
- Product listing and product detail pages (image gallery, features, price, add to cart)
- Product reviews: star ratings with an average and distribution, a review form for signed-in users, like/dislike, and admin replies shown under each review
- Signup / login, cart, checkout into an order, and order history
- Admin panel (`/admin`) to manage products, users, categories, brands, flavors, sliders and review comments
- Light / dark theme toggle, toast notifications, image upload with preview

## Requirements

- Node.js 20+
- The [backend](../backend/README.md) running (default `http://localhost:4000`) — pages fetch data from it on every request

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

Start the backend first (`cd ../backend && npm run start:dev`), otherwise pages that load products or sliders will show an error.

### Configuration

Create `frontend/.env.local` if the API is not at the default address:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

This single variable drives the GraphQL URL (`/graphql`) and upload URL (`/upload`); see `app/lib/config.ts`.

If the backend runs on a different host or port, also update `images.remotePatterns` in `next.config.ts` (currently `http://localhost:4000/uploads/**`) so `next/image` can load uploaded pictures.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack on port 3000 |
| `npm run build` | Production build (run this and `npm start` before shipping; dev mode hides some production-only errors) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`, `next/typescript`) |

## Routes

| Route | Description |
| --- | --- |
| `/` | Home: slider + products |
| `/products`, `/products/[slug]` | Catalogue and product detail |
| `/cart`, `/orders` | Cart and order history (sign-in required) |
| `/auth`, `/auth/login`, `/auth/register` | Authentication |
| `/admin` | Admin dashboard (ADMIN role) |
| `/admin/products` (+ `new`, `[slug]/edit`) | Product management |
| `/admin/users` (+ `new`, `[id]/edit`) | User management |
| `/admin/comments` | Comment management: All / Unanswered / Answered tabs, reply, edit, delete |
| `/admin/categories`, `/admin/brands`, `/admin/flavors`, `/admin/sliders` | Catalogue lookups and hero slides |
| `/unauthorized` | Shown to signed-in non-admins who open `/admin` |

## Project structure

```
app/
├── layout.tsx          # RTL html shell, AuthProvider, toasts
├── page.tsx            # Home
├── products/  cart/  orders/  auth/  admin/  unauthorized/
├── providers/          # AuthProvider (token + user in localStorage)
├── components/         # Shared UI; admin/, auth/ and reviews/ subfolders
├── lib/
│   ├── graphql.ts      # fetch-based GraphQL client + one function per operation
│   ├── products.ts     # Shared TypeScript types
│   ├── auth.ts         # signup / login / logout
│   ├── config.ts       # API URLs from NEXT_PUBLIC_API_URL
│   ├── date.ts         # Persian date formatting
│   └── toast.ts        # react-toastify helpers
└── globals.css         # Tailwind import + design tokens (colors, radius, font)
public/                 # Fonts, product / slider / auth images
```

## How it works

- **Data:** `graphqlRequest()` in `app/lib/graphql.ts` sends `POST` requests to the backend and throws on HTTP or GraphQL errors. Add a new operation there and its types in `lib/products.ts`.
- **Auth:** after login the token and user are stored in `localStorage` (`auth-token`, `auth-user`) and the token is sent as `Authorization: Bearer …` on browser requests.
- **Reviews:** `components/reviews/ProductReviews` loads a product's reviews in the browser (so it can send your token and show your own votes) and mounts on the product page. `StarRating` is the single star widget, used for display and as the rating input. The moderation UI is `app/admin/comments` with `components/admin/CommentCard`.
- **Admin access:** `AdminGuard` redirects visitors without the `ADMIN` role. This is a client-side convenience; the backend enforces admin access for review moderation, but not yet for the other admin mutations (see the backend README).
- **Styling:** design tokens live in `app/globals.css` and are used through Tailwind utilities such as `bg-surface`, `text-muted`, `text-accent`.

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · AG Grid (admin tables) · Swiper (slider) · FilePond (uploads) · React Toastify · React Icons

## Related

- [Backend README](../backend/README.md)
- [Root README](../README.md)
