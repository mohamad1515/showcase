---
name: nutreko-home2-rebuild
description: Rebuild the Nutreko Home 2 supplement ecommerce experience step-by-step in the existing Next.js/TypeScript project, using the supplied UI specification as the visual source of truth. Use this skill whenever implementing or reviewing the Nutreko-inspired storefront.
---

# Nutreko Home 2 Rebuild Skill

## Mission

Rebuild the visual language and page architecture of Nutreko Home 2 inside the existing project without copying WordPress/Elementor implementation details. The target is a React/Next.js ecommerce storefront with reusable components, responsive behavior, RTL support, and data-driven product/category content.

The official theme listing confirms that Nutreko provides 5+ homepage demos, shop/product pages, blog pages, premade functional pages, multiple header/footer options, responsive layouts, sidebars, and WooCommerce-oriented ecommerce flows. The visual reference for this skill is specifically **Home 2 / preview 02**.

## Non-negotiable rules

1. Work in small, verifiable phases. Never rebuild the whole site in one pass.
2. Do not invent a new visual direction. Follow `nutreko-home2-ui-spec.json`.
3. Treat the UI spec as the source of truth for spacing, radius, borders, shadows, typography scale, colors, and responsive breakpoints.
4. Keep all repeated UI data-driven: products, categories, goals, promotions, articles, testimonials, footer links.
5. Build reusable primitives before page-specific sections.
6. Keep ecommerce behavior separate from presentation.
7. Preserve the existing project's backend/API architecture unless a task explicitly requires a change.
8. Do not hard-code product data inside visual components.
9. Every section must be responsive and tested at desktop, tablet, and mobile widths.
10. Do not claim pixel-perfect parity from memory. Compare against the reference screenshot/demo and iterate.

## Implementation order

### Phase 00 — Audit and baseline

Before changing code:

- inspect the existing repository structure;
- identify the current Next.js version and styling system;
- identify existing header/footer/product/card components;
- identify the existing GraphQL product model and API helpers;
- identify reusable icons and image assets;
- run the application and record the current route behavior;
- do not delete existing working functionality.

Deliverable:
- `docs/nutreko-baseline.md`

### Phase 01 — Design tokens

Create one central token source based on `nutreko-home2-ui-spec.json`.

Required token groups:

- colors
- typography
- spacing
- container widths
- radii
- borders
- shadows
- breakpoints
- motion
- product-card dimensions
- section spacing

Prefer CSS variables / Tailwind theme variables so the whole site can be tuned from one place.

Deliverable:
- global token implementation
- no duplicated raw design values where a token exists

### Phase 02 — Global shell

Implement:

1. announcement/top strip if enabled;
2. desktop header;
3. navigation;
4. search;
5. account;
6. wishlist;
7. cart;
8. mobile header;
9. mobile navigation/drawer;
10. footer.

The header must be reusable across all inner pages.

Acceptance:
- same header/footer can be rendered on Home, Shop, Product, Blog and content pages;
- mobile navigation does not alter desktop layout;
- icons have consistent dimensions and hit areas.

### Phase 03 — Shared ecommerce primitives

Build and stabilize:

- `SectionHeading`
- `ProductCard`
- `ProductGrid`
- `ProductCarousel`
- `CategoryCard`
- `GoalCard`
- `PromoBanner`
- `Price`
- `Rating`
- `DiscountBadge`
- `WishlistButton`
- `AddToCartButton`
- `QuantityControl`
- `Breadcrumbs`
- `Pagination`
- `EmptyState`
- `LoadingSkeleton`

Product cards should support:
- image;
- category;
- title;
- rating;
- current price;
- old price;
- discount badge;
- wishlist;
- hover state;
- optional quick action.

### Phase 04 — Home 2 structure

Implement Home 2 in this order:

1. Hero / primary promotional banner
2. Two promotional side banners
3. Shop by Goals
4. Best Sellers
5. Trending Now
6. Trust / service strip
7. Dependable Products / Exceptional Service editorial block
8. Top Picks For You
9. Customer Love / testimonials
10. Articles & Advice
11. Community / social image strip
12. Footer

Do not proceed to the next section until the current section is visually stable.

### Phase 05 — Shop and category architecture

Create:

- `/shop`
- `/category/[slug]`

Required capabilities:

- product grid;
- sorting;
- pagination or load-more;
- sidebar/filter drawer;
- price filter;
- category filter;
- availability;
- responsive filter UI;
- empty state;
- loading state.

The theme supports shop/product pages and sidebar variations; reproduce the user-facing behavior rather than WordPress internals.

### Phase 06 — Product detail

Create:

- `/product/[slug]`

Required areas:

- gallery;
- product title;
- rating/review count;
- price;
- old price;
- discount;
- short description;
- quantity;
- add to cart;
- wishlist;
- product metadata;
- tabs/accordions for description, ingredients, usage, warnings;
- related products;
- recently viewed if the project supports it.

For supplements, prioritize readable ingredient and usage information.

### Phase 07 — Cart and checkout

Create:

- `/cart`
- `/checkout`

Cart:
- product thumbnail;
- title;
- quantity;
- price;
- subtotal;
- remove;
- coupon;
- totals;
- shipping summary;
- checkout CTA.

Checkout:
- contact information;
- shipping address;
- delivery method;
- payment method;
- order summary;
- validation;
- success/error states.

### Phase 08 — Customer area

Create:

- `/account`
- `/account/login`
- `/account/register`
- `/account/orders`
- `/account/order/[id]`
- `/account/profile`
- `/account/addresses`
- `/account/wishlist`

Keep authentication behavior isolated from UI components.

### Phase 09 — Blog/content

Create:

- `/blog`
- `/blog/[slug]`
- `/about`
- `/contact`
- `/faq`
- `/search`
- `/404`

Blog archive should support:
- featured article;
- article grid;
- category/tag;
- pagination;
- search.

Single article should support:
- title;
- metadata;
- hero image;
- content;
- related articles;
- share actions.

### Phase 10 — Responsive pass

Test at minimum:

- 1440px
- 1280px
- 1024px
- 768px
- 390px
- 360px

Check:
- no horizontal overflow;
- no clipped text;
- no broken product images;
- mobile tap targets;
- carousel behavior;
- header collapse;
- filter drawer;
- typography wrapping;
- section spacing.

### Phase 11 — Visual QA

For each route:

1. render at a fixed viewport;
2. compare against the reference;
3. fix macro layout first;
4. fix typography second;
5. fix spacing third;
6. fix borders/radius/shadows fourth;
7. fix icons/images last.

Never compensate for a wrong layout with arbitrary transforms.

## Home 2 visual hierarchy

The reference has a clean white/light storefront with strong black typography and a vivid neon-green brand accent. Promotional imagery uses dark fitness photography and product packshots. Product areas are intentionally spacious and minimal.

The Home 2 composition is driven by:

- large visual hero;
- compact promotional cards;
- goal-based discovery;
- dense but airy product grids;
- editorial banners;
- trust/service information;
- testimonials;
- content marketing;
- dark footer.

The visual system should feel premium, athletic, direct and product-focused.

## Component architecture

Suggested structure:

```text
src/
  app/
    page.tsx
    shop/
    category/[slug]/
    product/[slug]/
    cart/
    checkout/
    account/
    blog/
    blog/[slug]/
    about/
    contact/
    faq/
    search/
  components/
    layout/
    navigation/
    product/
    category/
    promotion/
    content/
    reviews/
    common/
  data/
    navigation.ts
    products.ts
    categories.ts
    goals.ts
    promotions.ts
    articles.ts
  styles/
    tokens.css
  lib/
    api/
    ecommerce/
```

Adapt paths to the existing project rather than forcing this exact structure.

## Definition of done

A phase is complete only when:

- TypeScript has no new errors;
- ESLint/formatter is clean;
- desktop and mobile behavior work;
- reusable components are actually reused;
- no unnecessary duplication exists;
- visual tokens are centralized;
- data is not embedded in presentational components;
- the route can be refreshed directly without breaking.

## Important visual constraint

The supplied UI specification is a forensic reconstruction from the publicly visible Home 2 reference and screenshots. It should be treated as the implementation baseline, but exact pixel parity requires screenshot comparison against the live reference at the same viewport. Do not assume a guessed hex value is an original source token.
