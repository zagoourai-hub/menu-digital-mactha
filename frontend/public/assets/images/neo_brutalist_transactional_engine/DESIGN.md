---
name: Neo-Brutalist Transactional Engine
colors:
  surface: '#fcf8f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414937'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717a66'
  outline-variant: '#c1cab2'
  surface-tint: '#3b6a00'
  primary: '#5ea500'
  on-primary: '#ffffff'
  primary-container: '#5ea500'
  on-primary-container: '#193200'
  inverse-primary: '#8fdb42'
  secondary: '#f5f5f5'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#005ac3'
  on-tertiary: '#ffffff'
  tertiary-container: '#5491ff'
  on-tertiary-container: '#002a62'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aaf85c'
  primary-fixed-dim: '#8fdb42'
  on-primary-fixed: '#0e2000'
  on-primary-fixed-variant: '#2b5000'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#aec6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#ffffff'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  foreground: '#0a0a0a'
  card: '#ffffff'
  card-foreground: '#0a0a0a'
  popover: '#ffffff'
  popover-foreground: '#0a0a0a'
  primary-foreground: '#fafafa'
  secondary-foreground: '#171717'
  muted: '#f5f5f5'
  muted-foreground: '#737373'
  accent: '#f5f5f5'
  accent-foreground: '#171717'
  destructive: '#e7000b'
  destructive-foreground: '#fef2f2'
  border: '#e5e5e5'
  input: '#e5e5e5'
  ring: '#a1a1a1'
  chart-1: '#91c5ff'
  chart-2: '#3a81f6'
  chart-3: '#2563ef'
  chart-4: '#1a4eda'
  chart-5: '#1f3fad'
  sidebar: '#fafafa'
  sidebar-foreground: '#0a0a0a'
  sidebar-primary: '#171717'
  sidebar-primary-foreground: '#fafafa'
  sidebar-accent: '#f5f5f5'
  sidebar-accent-foreground: '#171717'
  sidebar-border: '#e5e5e5'
  sidebar-ring: '#a1a1a1'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Cantora One
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  title-md:
    fontFamily: Cantora One
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg:
    fontFamily: Cantora One
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Cantora One
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Cantora One
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Fira Code
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-sm:
    fontFamily: Fira Code
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  price-tag:
    fontFamily: Fira Code
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: -0.02em
  code-snippet:
    fontFamily: Fira Code
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a bold, crisp, neo-brutalist transactional aesthetic engineered for high-velocity digital ordering and point-of-sale environments. The identity pairs architectural discipline with energetic utility: stark white backdrops ground the interface, punctuated by an electric lime-green brand hue that drives clear call-to-actions, payment confirmations, and conversion pathways.

### Design Movement & Core Philosophy
- **Neo-Brutalist Geometry:** Uncompromising sharp corners (`0rem` radius), structural hairline boundaries (`#e5e5e5`), and hard directional drop shadows (`5.5px 7.5px 8.5px -5px`) construct an unmistakable physical feel on digital glass.
- **Transactional Clarity:** Zero cognitive drag. Visual hierarchy is achieved through high-contrast typography, strict grid alignment, and disciplined color attribution where lime green indicates interactive intent, destructive crimson signals risk or inventory stock-outs, and cool blue scales govern analytics.
- **Tactile Micro-Interactions:** Buttons, chips, and quantity selectors behave like physical switches—snapping crisply with high-contrast outlines and directional offsets.

## Colors

The color palette directly maps to the `:root` tokens specified in `index.css`. The system leverages an ultra-crisp white base anchored by high-contrast near-black typography and interactive chartreuse-lime.

### Palette Governance
- **Base Surfaces & Text:** The application canvas operates on pure `#ffffff` with base text at `#0a0a0a`. Card and popover containers share `#ffffff` with primary text `#0a0a0a`.
- **Primary Interactive:** `#5ea500` is reserved for decisive user actions, checkout triggers, confirmed orders, and active states. It pairs strictly with `#fafafa` foreground text to guarantee accessible contrast.
- **Secondary & Subtle Elements:** `#f5f5f5` provides background fill for inactive tabs, muted badges, and accent container hover states, paired with `#171717` foreground text.
- **Dividers & Structural Borders:** All card frames, inputs, table lines, and container splits utilize `#e5e5e5`. Focus indications use `#a1a1a1` with 50% opacity via the global ring rule (`outline-ring/50`).
- **Destructive Alerts:** `#e7000b` accompanied by `#fef2f2` foreground text represents critical state changes, deletions, validation alerts, and out-of-stock badges.
- **Data Visualizations:** Charting components strictly use the blue gradient series (`#91c5ff`, `#3a81f6`, `#2563ef`, `#1a4eda`, `#1f3fad`), maintaining clear chromatic independence from the green operational tokens.

## Typography

Typography establishes a deliberate contrast between editorial character, stylized sans utility, and tabular monospace rigor:

- **Editorial Headings (Playfair Display):** Deployed for prominent landing titles, hero headers, section milestones, and category showcases to infuse refined visual distinction.
- **Interface & Content Body (Cantora One):** Acts as the foundational UI sans-serif typeface across card titles, descriptions, navigation anchors, button copy, and instructional alerts.
- **Technical & Financial Elements (Fira Code):** Monospaced precision for monetary figures, prices, order numbers, transaction tokens, time stamps, and tabular status tags. Currency strings align tabularly across menus and checkout summaries.
- **Base Letter Spacing:** Maintained at `0em` (`--tracking-normal`) across body layouts, with slight negative tightening applied to large financial indicators.

## Layout & Spacing

Layouts adhere to an absolute 4px (`0.25rem`) increment system derived from the foundational `--spacing: 0.25rem` property.

### Spatial Rhythm & Column Layout
- **Mobile Handheld (360px – 639px):** 4-column fluid grid. Gutter and margin locked at `1rem` (16px). Cards, inputs, and selection steps occupy full-width blocks or 2-column compact product grids.
- **Tablet / POS Display (640px – 1023px):** 8-column layout with `1rem` gutters. Accommodates split views featuring a sticky live order receipt column alongside a 2-column menu collection.
- **Desktop & Administrative Panels (1024px+):** 12-column layout with max-width container locked to 1280px, flanked by `1.5rem` gutters and `2rem` outer margins. Administrative back-office views utilize a fixed 240px sidebar alongside data grids.
- **Component Touch Bounds:** All touchable interactive elements adhere to a strict 44×44px minimum bounding box.

## Elevation & Depth

Visual hierarchy abandons diffuse ambient shadows in favor of a crisp neo-brutalist depth paradigm governed by distinct directional offsets and high contrast.

### Shadow Metric Specification
- **Base Offset & Blur:** X offset: `5.5px`, Y offset: `7.5px`, Blur radius: `8.5px`, Spread: `-5px`.
- **Base Shadow Opacity:** `0.62` using a neutral black tone `hsl(0 0% 0% / 0.62)`.
- **Layered Construction:**
  - **Flat Tier (Zero Shadow):** Base canvas and embedded form inputs rely solely on a 1px solid stroke (`#e5e5e5`).
  - **Standard Card Elevation (`shadow`):** `5.5px 7.5px 8.5px -5px hsl(0 0% 0% / 0.62), 5.5px 1px 2px -6px hsl(0 0% 0% / 0.62)` delivers an immediate tactile offset.
  - **Overlay / Modal Floating Tier (`shadow-xl`):** `5.5px 7.5px 8.5px -5px hsl(0 0% 0% / 0.62), 5.5px 8px 10px -6px hsl(0 0% 0% / 0.62)` elevates dropdown menus, popovers, and sticky cart action sheets above the main canvas.
- **Border Integration:** Every elevated container pairs its directional drop shadow with a structural 1px border (`#e5e5e5`), preserving edge sharpness across high-density screens.

## Shapes

The shape system strictly enforces a zero-radius geometry (`--radius: 0rem`), maintaining hard-edged neo-brutalist discipline across every component surface.

### Boundary Tokens & Formats
- **Standard Corners (`0rem` / Sharp):** All buttons, input containers, category chips, modal dialogs, cards, and dropdown popovers must be rendered with square 90-degree corners.
- **Derived Token Execution:**
  - `--radius-sm`: `0rem` (clamped)
  - `--radius-md`: `0rem` (clamped)
  - `--radius-lg`: `0rem`
  - `--radius-xl`: `4px` (reserved strictly for outer system banner containers or explicit framing overlays where minor relief is structurally required).
- **Global Border Enforcement:** Applied universally via `* { border-color: #e5e5e5; }`. Focus rings utilize an outline of `#a1a1a1` at 50% opacity.

## Components

### Buttons
- **Primary Action Button:** Background `#5ea500`, foreground `#fafafa`, font `Cantora One`, 44px height, 0rem border radius, 1px solid `#5ea500`. On active press, the component translates down-right by `2px` while its directional shadow decreases accordingly.
- **Secondary Button:** Background `#f5f5f5`, foreground `#171717`, border 1px solid `#e5e5e5`, sharp corners. Hover switches background to `#e5e5e5`.
- **Destructive Button:** Background `#e7000b`, foreground `#fef2f2`, sharp corners, paired with directional shadow for immediate risk visibility.
- **Quantity Steppers:** Paired `+` and `-` square buttons (36×36px) with 1px border `#e5e5e5`, zero radius, flanking a centered monospace numeric counter.

### Cards & Surfaces
- **Interactive Menu Item Card:** Background `#ffffff`, foreground `#0a0a0a`, 1px solid border `#e5e5e5`, sharp 0rem corners, directional shadow `5.5px 7.5px 8.5px -5px hsl(0 0% 0% / 0.62)`. Contains item image, Playfair Display title, Cantora One description, and Fira Code price indicator.
- **Popover / Flyout Containers:** Background `#ffffff`, foreground `#0a0a0a`, 1px solid border `#e5e5e5`, elevated by `shadow-xl` offset.

### Chips & Filter Tabs
- **Filter Chip:** 36px height, 0rem sharp edges, 1px solid border. Active chips feature `#5ea500` background with `#fafafa` text. Inactive chips use `#f5f5f5` with `#171717` text and `#e5e5e5` border.

### Form Inputs & Text Fields
- **Text Inputs:** Background `#ffffff`, border 1px solid `#e5e5e5`, text `#0a0a0a`, placeholder `#737373`, 0rem corners. Focus states exhibit a crisp 2px outline using `#a1a1a1` at 50% opacity (`outline-ring/50`).
- **Checkboxes & Radios:** Sharp square indicators with 1px solid `#e5e5e5`. When checked, surfaces fill with `#5ea500` displaying a white checkmark or center square.

### Transactional & POS Modules
- **QRIS Payment Module:** Centered sharp card with white quiet zone, surrounded by a 1px `#e5e5e5` stroke and directional drop shadow. Expiration timer and billing total rendered in `Fira Code` bold.
- **Order Progress Stepper:** Linear segmented indicator utilizing squared steps connected by solid `#5ea500` fill lines for completed states and `#e5e5e5` for upcoming segments.