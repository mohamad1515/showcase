# Nutreko Home 2 Baseline

## Existing application

- Frontend: Next.js 15.5.19, React 19.1, TypeScript, Tailwind CSS 4.
- The app is Persian and right-to-left; Vazir is loaded locally from `public/fonts`.
- `app/components/AppShell.tsx` owns the shared storefront header and footer and excludes auth/admin routes.
- `app/page.tsx` is a server component. It obtains products and slider content through `app/lib/graphql.ts` and composes the existing category, offer, news, banner, and product showcase sections.
- Product cards and cart actions already exist. The frontend GraphQL client and NestJS backend are retained as the data and commerce boundary.
- Local image assets already exist for the logo, homepage sliders, side promotions, and categories.

## Baseline checks

- `npm run lint` in `frontend`: passes with 10 existing warnings and no errors.
- The workspace terminal history records a successful frontend production build before this implementation session; rerun after the homepage phases.
- Browser verification of the baseline routes is pending; the initial session had no confirmed running storefront/API servers.

## First visual mismatch

Before the token update, global surfaces were gray and the accent was standard green (`#22c55e`). The Home 2 specification calls for a white surface, near-black text, and neon green (`#7dff2a`). The existing global CSS is the owning shared layer, so its semantic variables are the first implementation surface.
