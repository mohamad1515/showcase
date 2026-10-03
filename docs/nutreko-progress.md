# Nutreko Home 2 Progress

- [x] Read the skill, implementation plan, and UI specification.
- [x] Audit the frontend entry point, shared shell, product card, GraphQL client, and local visual assets.
- [x] Record the existing frontend baseline in `docs/nutreko-baseline.md`.
- [x] Replace the shared gray/standard-green palette with the specified white/neon-green palette.
- [x] Add centralized layout, spacing, typography, control, radius, shadow, and motion tokens.
- [x] Refresh the shared header, mobile search visibility, category navigation, and dark multi-column footer.
- [x] Rebuild the available Home 2 sections: hero, two promotions, goals/categories, rated products, latest products, service strip, editorial, real reviews when available, articles, and footer.
- [x] Keep products/sliders/reviews data connected to GraphQL; move home promotions, categories, and articles into data modules.
- [x] Add `/blog` and `/blog/[slug]` with direct-route support and 404 behavior.
- [x] Add real shop sorting, category/availability/maximum-price filters, empty state, and load-more on the existing `/products` route.
- [x] Add `/category/[slug]` using backend category slugs and the shared catalog.
- [x] Keep add-to-cart visible on touch layouts and show real review ratings on shared product cards.
- [x] Prevent the cart from creating an order while its payment gateway is disabled.
- [x] Verify responsive widths 1440, 1280, 1024, 768, 390, and 360px; no horizontal overflow was measured.
- [x] Recheck final shop grid at all six widths: 4 columns wide desktop, 3 tablet, 2 mobile; no horizontal overflow.
- [x] Verify production HTTP responses for `/`, `/products`, `/category/protein`, `/blog`, and a blog detail route; unknown category/article slugs return 404.
- [x] Run the final production build after the latest category/catalog changes; Next generated 26 pages/routes.
- [x] Run frontend ESLint and editor diagnostics; no errors, with 7 pre-existing warnings outside the changed functionality.
- [ ] Implement real checkout/payment, full customer account routes, search route, and additional content pages.
- [ ] Add curated testimonials/community assets or sales-based top picks when genuine data is available.
- [ ] Repeat browser interaction checks against the normal `http://localhost:3000` origin after restarting its existing `next start` process; it returned HTTP 500 during this session, and its process was left untouched. The fresh build preview on 3003 is healthy, but browser-side GraphQL is blocked there by the backend's CORS allowlist.

## Current constraints

- Backend product fields do not include sales counts; the storefront does not claim items are best sellers.
- The backend has per-product reviews but no aggregate review feed. The homepage samples up to three review-bearing products and hides the testimonial section when no reviews are returned.
- The backend currently enables CORS for `http://localhost:3000` only. The existing process on port 3000 could not be controlled from this session; the final production preview ran on `http://localhost:3003`, so browser-side GraphQL search was blocked by CORS there.
- Checkout/payment is disabled in the current backend/UI; pressing the cart checkout action now clearly reports that no order was created.
