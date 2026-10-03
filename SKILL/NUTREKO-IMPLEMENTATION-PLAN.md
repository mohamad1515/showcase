# Nutreko Home 2 — Step-by-Step Implementation Plan

## Reference

Primary visual reference: Nutreko Home 2 / preview 02.

The official listing describes Nutreko as a responsive WooCommerce theme with 5+ homepage demos, shop/product pages, blog pages, premade functional pages, multiple header/footer options and sidebar variations.

## Recommended build sequence

1. Repository audit
2. Global design tokens
3. Header + navigation
4. Footer
5. Product primitives
6. Home 2 hero
7. Home 2 promotional cards
8. Shop by Goals
9. Best Sellers
10. Trending Now
11. Service strip
12. Exceptional Service editorial block
13. Top Picks
14. Testimonials
15. Articles & Advice
16. Community strip
17. Shop page
18. Category page
19. Product page
20. Cart
21. Checkout
22. Account
23. Blog
24. Static pages
25. Search / 404
26. Responsive QA
27. Visual regression pass
28. Performance/accessibility/SEO pass

## Page inventory

### Core storefront
- Home 2
- Shop
- Category
- Product
- Cart
- Checkout

### Customer
- Account
- Login
- Register
- Orders
- Order detail
- Profile
- Addresses
- Wishlist

### Content
- Blog archive
- Blog detail
- About
- Contact
- FAQ
- Search
- 404

## QA rule

Do not start a new page while the previous page still has unresolved macro-layout differences. Always fix:

1. structure
2. dimensions
3. typography
4. spacing
5. borders/radius
6. shadows
7. icons/images
8. micro-interactions

## Important note on "100% similarity"

The public demo exposes screenshots and rendered output, not the original Figma/design-token file. Therefore no responsible implementation can guarantee 100% exact hex/radius/shadow values from the public preview alone. The supplied UI spec intentionally marks estimated values. Pixel-level parity should be achieved by screenshot comparison at fixed viewport sizes and iterative calibration.
