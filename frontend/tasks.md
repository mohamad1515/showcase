# tasks.md — pages not touched by the last re-skin

The re-skin in commit `e22c3fa` ("Re-skin home, products, and blog pages with web's richer section layout") only touched: home (`app/page.tsx`), `/products`, `/products/[slug]`, `/blog`, `/blog/[slug]`, and the new `/contact`. Everything below still runs on its original markup/styling — per instruction, these stay as-is until explicitly picked up, since `web` has no equivalent page for any of them to port from.

## Auth

- [x] `app/auth/page.tsx`
- [x] `app/auth/login/page.tsx`
- [x] `app/auth/register/page.tsx`

## Cart & orders

- [x] `app/cart/page.tsx`
- [x] `app/orders/page.tsx`

## Category browsing

- [x] `app/category/[slug]/page.tsx`

## Misc

- [x] `app/unauthorized/page.tsx`

## Admin panel

- [ ] `app/admin/page.tsx` (dashboard)
- [ ] `app/admin/products/page.tsx`
- [ ] `app/admin/products/new/page.tsx`
- [ ] `app/admin/products/[slug]/edit/page.tsx`
- [ ] `app/admin/categories/page.tsx`
- [ ] `app/admin/brands/page.tsx`
- [ ] `app/admin/flavors/page.tsx`
- [ ] `app/admin/sliders/page.tsx`
- [ ] `app/admin/users/page.tsx`
- [ ] `app/admin/users/new/page.tsx`
- [ ] `app/admin/users/[id]/edit/page.tsx`
- [ ] `app/admin/comments/page.tsx`

(See [DESIGN.md](DESIGN.md) for the extracted `web` visual language and [README-admin.md](../../README-admin.md) for the admin panel's current structure, when any of these get picked up.)
