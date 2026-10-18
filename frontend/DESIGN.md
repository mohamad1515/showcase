# DESIGN.md — visual design system extracted from `web`

Source: `web/app/global.css` (the "Mixlix - Health & Supplement Landing Page" template's `style.css` section — originally authored against Bootstrap 5 class names) and `web/app/layout.tsx`. This documents `web`'s **visual language only** — colors, type, spacing, shapes — not its markup or logic, and translates it into Tailwind terms throughout rather than the original Bootstrap selectors, since `showcase/frontend` has no Bootstrap and should stay that way. It lives in `showcase/frontend` as a reference for restyling/porting decisions, since the pages already re-skinned here (home, products, blog, contact — see git log) borrowed `web`'s structure but not its raw CSS.

## Brand colors

Primary CTA color is an orange gradient, not a flat color:

| Tailwind token (suggested) | Value | Used for |
|---|---|---|
| `primary-from` / `primary-to` | `#ff5600 → #ffa705` (as a `bg-gradient-to-r from-[#ff5600] to-[#ffa705]`, with a 3-stop `from-[#ff5600] via-[#ffa705] to-[#ff5600]` on hover-animated buttons) | Main CTA buttons, scroll-to-top, active nav links, section accents |
| `capsule` | `#c9504a` (coral/red) | "Capsule" product-variant theme, one nav/header skin, a secondary scroll-top variant |
| `protein` | `#00b0d5` (cyan) | "Protein" product-variant theme, matching buttons/scroll-top |
| `special` | `#8bcd2b` (green) | "Special" product-variant theme, matching buttons/scroll-top |
| `amber` | `#ffb22b` | Third scroll-top variant, some badges |
| `heading` | `#222222` | All `h1`–`h6` |
| `body-text` | `#777777` | Paragraph default |
| `surface-tint` | `#f5f5f5`, `#f7f8fa`, `#edf8ff` | Section backgrounds, default button background |
| `border-tint` | `#ebebeb`, `#eceff8` | Dividers, outlined-button borders |

These four accent colors (orange/coral/cyan/green) aren't a single brand palette — they're **per-section theme variants** the original template used to differentiate product categories (default / capsule / protein / special), each with matching buttons, scroll-to-top, and link-hover colors. Treat them as a themeable set, not one fixed brand color.

**Note:** `showcase/frontend`'s current token set (`app/globals.css`) uses a single lime-green accent (`--accent: #7dff2a`) and a neutral gray/white surface system — structurally and chromatically unrelated to any of `web`'s palette above. Reusing `web`'s colors as-is would mean introducing new tokens alongside the existing ones, not replacing them category-for-category.

## Typography

- Headings (`h1`–`h6`): **Poppins**, weight 700, color `#222222`.
  - `h1` 40px · `h2` 35px · `h3` 28px · `h4` 22px · `h5` 18px · `h6` 16px
- Body (`body`, `p`): **Roboto**, weight 400, color `#777777`, base `16px`, paragraph `line-height: 26px`.
- Both loaded from Google Fonts (`@import url(".../css2?family=Poppins:...&family=Roboto:...")`), Latin-only weights — **no Persian/Farsi webfont**, even though the template's sample copy is Persian.
- `showcase/frontend` instead self-hosts **Vazir/Vazirmatn** (`app/globals.css` `@font-face`) specifically because it's RTL/Persian throughout (`lang="fa" dir="rtl"`). Porting `web`'s type choices directly would regress Persian glyph coverage — Vazir should stay the font of record if/when any of `web`'s layout patterns are adopted further.

## Spacing & layout rhythm

- Original margin/padding scale was a 5px-stepped utility set (`5, 10, 15, ..., 200`), with page sections commonly combining e.g. `120px` top / `115px` bottom. In Tailwind terms this is just arbitrary-value spacing — `pt-[120px] pb-[115px]` — rather than a fixed step scale; there's no need to recreate the 5px-increment class set itself.
- Grid gutters were `30px` at the row level (occasionally `1.5rem`/`24px`) — equivalent to Tailwind `gap-x-[30px]` / `gap-6`.
- Container widths: `1140px`/`1200px` for standard sections, a wider `1470px` custom container for hero/banner-style sections, and a narrower `1000px` for content-focused blocks (e.g. blog body) — i.e. `max-w-[1140px]`, `max-w-[1470px]`, `max-w-[1000px]` as needed, not one fixed container.
- `showcase/frontend` instead defines a single fixed `--container-width: 1200px` with responsive padding tokens (`--container-padding-desktop/tablet/mobile`) and section-spacing tokens (`--section-space-desktop/tablet/mobile` = 72/56/40px) — a simpler, token-driven version of the same idea rather than multiple ad-hoc container widths.

## Shape & elevation

- Buttons are pill-shaped by default: `rounded-full` (`border-radius: 50px`). Icon badges inside buttons are fully circular: `rounded-full` on a square box (`border-radius: 50%`).
- Cards/panels mostly use `rounded-2xl` (`border-radius: 16px` — the next most common value after the pill/circle shapes and `0`).
- Box-shadows are soft and colored to match the nearby accent, not neutral black, e.g.:
  - `0px 16px 32px rgba(201, 80, 74, 0.1)` (capsule/coral-tinted)
  - `0px 8px 16px rgba(255, 122, 2, 0.1)` (orange-tinted)
  - `0px 8px 16px rgb(0 176 213 / 10%)` (cyan-tinted)
  - `0px 16px 32px rgba(0, 0, 0, 0.1)` (neutral, used more sparingly)
- `showcase/frontend` instead uses a small fixed shadow scale (`--shadow-card`, `--shadow-hover`, `--shadow-dropdown`, `--shadow-modal`) that is neutral black at varying opacity/blur — no accent-tinted shadows currently exist in the showcase token set.

## Buttons (variant inventory, as Tailwind utility combinations)

| Variant | Tailwind-equivalent styling |
|---|---|
| Default | `rounded-full bg-[#edf8ff] text-[#222222] font-bold px-9 py-2.5` — no border |
| Gradient CTA | `rounded-full bg-gradient-to-r from-[#ff5600] via-[#ffa705] to-[#ff5600] bg-[length:200%_auto] text-white transition-[background-position] duration-500 hover:bg-right`, with a circular white icon badge |
| Outlined | `rounded-full border-2 border-[#ebebeb] bg-transparent hover:border-[#222222]` |
| Capsule (solid coral) | `rounded-none bg-[#c9504a] text-white uppercase font-bold px-12 py-5` with a circular reveal animation on hover |
| Protein (solid cyan) | `rounded-full bg-[#00b0d5] text-white` |
| Special (solid green) | `rounded-full bg-[#8bcd2b] text-white` |

## Iconography & motion

- Icons: Flaticon (custom icon font) + Font Awesome 5 (brands/pro subsets) — not an SVG icon library like `react-icons`, which `showcase/frontend` uses throughout.
- Standard transition timing: `all 0.3s ease-out` on links/buttons; gradient buttons animate over `0.4s linear` (background-position sweep); scroll-to-top fades over `1s ease`.
- Carousels: originally Slick (jQuery) per the template's `slick.css`; `web`'s Next.js port replaced this with Embla (`embla-carousel-react`) for the same visual rhythm.

## Section inventory (for cross-reference)

`style.css`'s own index lists the sections this design system was built for: Header, Mobile-menu, Search, Off-canvas, Breadcrumb, Banner, Brand, Features, Choose-area, Video-area, Gallery, Fact (stats), Faq, Pricing, Ingredients, Shop, Shop-details, Product-info, Cta, Testimonial, Blog, Pagination, Newsletter, Contact, Footer, Preloader. This maps directly to the component set under `web/components/` and is what the already-ported pages in `showcase/frontend` (home/products/blog/contact) drew their structure from.

## Takeaway for `showcase/frontend`

Nothing here has been applied yet — `showcase/frontend` keeps its own Tailwind token system (lime accent, neutral shadows, Vazir font, token-based spacing) and the recent re-skin only borrowed `web`'s page **structure**, not these raw values. This file exists so that if `web`'s visual identity (the orange/coral/cyan/green theme-variant system, Poppins/Roboto type, pill buttons, accent-tinted shadows) is ever wanted here too, there's a single reference for what to extract and where it conflicts with what already exists.
