# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Discerning Diners & Guests**:
   - Seeking a luxury culinary experience across authentic Indian, Chinese, and Continental repertoire.
   - Performing contactless table ordering inside the dining room, express pickup/takeaway, or home delivery ordering.
   - Values speed, clear dietary tagging (Veg vs. Non-Veg), flexible portion steppers (Half vs. Full), and an uninterrupted in-page checkout drawer.

2. **Restaurant Operations & Kitchen Staff**:
   - Floor managers and head chefs managing the live kitchen dispatch queue.
   - Updating dish availability, adjusting pricing, managing categories, and reviewing transaction totals in real-time.

## Product Purpose

Food Hub (The Flavour Junction) is a full-stack digital restaurant experience that elevates culinary ordering into an art form. It bridges the gap between high-end gastronomy and modern web engineering by offering diners instantaneous, zero-friction ordering across multiple dining modes while equipping management with a real-time kitchen operations dashboard.

## Positioning

An artisanal fine-dining digital platform that blends Michelin-caliber visual elegance with high-speed operational efficiency—offering seamless in-page checkout, multi-mode fulfillment (Home Delivery, Dine-In Table, Takeaway), and transparent portion pricing without routing friction or generic third-party aggregator clutter.

## Operating Context

- **Dining Room**: Diners scan a table QR code or browse from mobile/desktop browsers at the table, specifying their table number for immediate floor service.
- **Home & Office**: Customers ordering premium multi-course meals with live delivery partner fee calculations and landmark-precise dispatch.
- **Kitchen & Management Back-Office**: Floor operators reviewing active preparation queues, updating menu availability, and monitoring daily settlements on desktop/tablet POS displays.

## Capabilities and Constraints

- **Three Fulfillment Modes**: Home Delivery (with automated delivery fee waiver over ₹500), Dine-In Table (with validated table number), and Takeaway (with counter collection notes).
- **Portion Steppers**: Dynamic pricing and cart grouping for Half (4 pcs/half portion) and Full (8 pcs/full portion) servings.
- **Dietary Indicators**: Strict visual distinction between Pure Vegetarian and Non-Vegetarian dishes.
- **In-Page Checkout Drawer**: Radix UI modal overlay maintaining active cart context with zero route jumping.
- **Payment Processing**: Integrated Razorpay modal with client-side verification (`/api/verify-payment`) and demo-mode fallback.
- **Back-Office Management**: JWT-authenticated administrative portal for order dispatch status toggling (`pending` -> `in_progress` -> `delivered` / `cancelled`), menu item CRUD, and category management.
- **Stack Constraints**: React 19 + Tailwind CSS 3.4 (pure npm, no external CRACO/Yarn) frontend + FastAPI (Python 3.11/3.14) + MongoDB Atlas backend.

## Brand Commitments

- **Name**: Food Hub (The Flavour Junction)
- **Visual Identity**: Warm antique gold (`#dfb128` / `#f59e0b`) paired with deep jewel slate (`#0c0a09` / `#09090b`), warm whites (`#f7f6f2`), and emerald badges.
- **Typography**: Editorial serif headings (`Playfair Display`) paired with crisp geometric sans-serif (`DM Sans`).
- **Tone & Voice**: Warm, refined, hospitable, and authoritative. Culinary descriptions celebrate craftsmanship, fresh regional spices, and hygienic artisanal kitchen standards.

## Evidence on Hand

- Production catalog spanning 50+ menu items across 13 culinary categories (Momos, Chaat, Paneer, Chinese Appetizers, Shakes, Beverages, Indian Curries).
- Real-time order dispatch API with MongoDB persistence and Razorpay payment signatures.
- High-resolution visual screenshots documented in `docs/screenshots/` (hero, menu catalog, in-page checkout drawer, admin dashboard, kitchen orders).

## Product Principles

1. **Context Preservation**: Diners must never lose their shopping bag context, menu position, or filter states when completing an order.
2. **Culinary Honesty**: Every dish displays accurate dietary flags, transparent portion pricing, preparation notes, and real ingredients without deceptive upcharges.
3. **Frictionless Hospitality**: Fast, responsive interactions from dish selection to payment verification with intuitive feedback and zero unnecessary form barriers.
4. **Operational Clarity**: Kitchen staff need instant, unambiguous order details (table number, cooking instructions, customer contact) without visual clutter.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA standards: high-contrast text on dark backgrounds (`#dfb128` and `#f7f6f2` on `#09090b`), visible `:focus-visible` golden focus rings, semantic form labels, and keyboard-dismissible modals (`Esc` support).
