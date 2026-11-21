---
name: Riffle
description: Hearth Corridor — cozy practice-room shell with interactive lesson map
colors:
  ink: "#2A221C"
  ink-deep: "#1C1712"
  ground: "#E4DDD2"
  porcelain: "#F3EEE6"
  rail: "#EBE4D8"
  route-cyan: "#355E57"
  signal-cyan: "#D4894A"
  path-amber: "#C9954A"
  path-green: "#4A6840"
  alert-scarlet: "#A65D4E"
  alert-hot: "#A65D4E"
  muted: "#5C534B"
  muted-ui: "#5C534B"
  border: "#D2C8BA"
  border-soft: "#E0D7CB"
  nav-hover: "#E0D8CC"
  nav-active-wash: "#DDE8E4"
  field-fill: "#EBE4D8"
  service-ok: "#4A6840"
  focus: "#3F6F66"
typography:
  display:
    fontFamily: "Gemunu Libre, sans-serif"
    fontSize: "clamp(2.1rem, 6vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Gemunu Libre, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Gemunu Libre, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Sofia Sans Condensed, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  label:
    fontFamily: "Sofia Sans Condensed, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  control: "6px"
  soft: "8px"
  panel: "10px"
  map: "14px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.55rem"
  md: "0.9rem"
  lg: "1rem"
  xl: "2rem"
  rail: "clamp(12rem, 18vw, 16rem)"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
  button-secondary:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
  button-secondary-hover:
    backgroundColor: "{colors.field-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.65rem"
  nav-link-active:
    backgroundColor: "{colors.nav-active-wash}"
    textColor: "{colors.route-cyan}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.65rem"
  panel:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "0.9rem 1rem"
  panel-dense:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.soft}"
    padding: "0.75rem 0.85rem"
  input-field:
    backgroundColor: "{colors.field-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
  map-callout:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.soft}"
    padding: "1rem"
  chip-genre:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
---

# Design System: Riffle

## Overview

**Creative North Star: "Hearth Corridor"**

Riffle’s Operate shell is a cozy practice-room network: warm limestone ground, walnut ink, and soft ivory panels. Navigation stays a familiar left rail; the signature surface is an **interactive** SVG corridor map — each route is a course phase (or genre preview before a roadmap exists), each station is a real lesson the learner can open.

Typography stays humanist and transit-clean: Sofia Sans Condensed for UI body and controls, Gemunu Libre for brand and display. Sea-glass teal marks route, nav, and focus; lamp amber owns primary CTAs; moss, clay, and amber are path/state inks only. Depth comes from soft walnut-tinted ambient shadows and tonal washes — never clinical pure white, cool-studio cyan, or dark neon.

**Key Characteristics:**
- Warm limestone ground + ivory panels (never clinical pure white)
- Interactive SVG corridor: stations = lessons, routes = course phases
- Fluid CSS grid that resizes with the viewport (no fixed absolute stage)
- Sea-glass route + lamp-amber CTAs; soft walnut ambient shadows
- Condensed sans UI + Gemunu display

## Colors

Warm practice-room neutrals carry the shell; sea-glass is the durable route accent; lamp amber is the only large “go” fill; moss/clay/amber stay as path and state inks.

### Primary
- **Sea-Glass Route** (`#355E57`): Active nav text, inset active rail, path structure, map line ink (token key `route-cyan`). Focus ring may use the slightly brighter companion `#3F6F66`.
- **Lamp Amber Signal** (`#D4894A`): Primary button and map-callout CTA fills (token key `signal-cyan`) — warm “go” on limestone ground with walnut ink type for contrast.

### Secondary
- **Path Amber** (`#C9954A`): Warning/state ink and line dots only — never large fills.
- **Path Moss** (`#4A6840`): Complete/positive path state ink and service-ok dots.

### Tertiary
- **Ember Clay** (`#A65D4E`): Notes, warn icons, interrupt path dots, alert copy.

### Neutral
- **Walnut Ink** (`#2A221C`): Body text and shell ink.
- **Ink Deep** (`#1C1712`): Brand, display headline, dense emphasis text; also primary CTA label on lamp amber.
- **Limestone Ground** (`#E4DDD2`): App canvas (with soft amber/teal ambient washes).
- **Ivory Panel** (`#F3EEE6`): Panels, callouts, map chrome — soft ivory, not pure white.
- **Rail Mist** (`#EBE4D8`): Left nav rail.
- **Muted Walnut** (`#5C534B`): Secondary copy, panel meta, hero subcopy.
- **Border / Border Soft** (`#D2C8BA` / `#E0D7CB`): Panel strokes and dividers.
- **Nav Hover / Active Wash** (`#E0D8CC` / `#DDE8E4`): Quiet interaction surfaces.
- **Field Fill** (`#EBE4D8`): Form fields and secondary button hover.

### Named Rules
**The Path-Ink Rule.** Amber, moss, and clay appear only as path/state signals (dots, warns, complete marks) — never as primary fills, hero washes, or marketing bands.

**The Two-Accent Rule.** Sea-glass (`#355E57`) owns navigation, focus, and path structure; lamp amber (`#D4894A`) owns primary CTAs. Do not swap them.

**The No-Clinical-White Rule.** Panels stay ivory (`#F3EEE6`); the canvas stays limestone (`#E4DDD2`). Pure `#FFFFFF` / cool gray studio shells are out of world.

## Typography

**Display Font:** Gemunu Libre (with sans-serif fallback)  
**Body Font:** Sofia Sans Condensed (with Segoe UI, sans-serif)  
**Label/Mono Font:** Sofia Sans Condensed (same family; weight and case carry hierarchy)

**Character:** Condensed humanist UI with a sturdy display face — transit-board clarity without enamel costume lettering, warmed for a practice-room mood.

### Hierarchy
- **Display** (700, `clamp(2.1rem, 6vw, 3.4rem)`, ~0.92): Overview “Practice continues” and brand-scale moments.
- **Headline** (600, ~1.875rem, 1.15): Section titles on Operate views (Preferences, Roadmap, Library, Practice).
- **Title** (600, ~1.25rem, 1.2): Map callout station name, card titles.
- **Body** (500, 1rem, 1.35): UI copy, dense lists, controls.
- **Label** (700, 0.72rem, tracked ~0.04em, often uppercase): Panel titles, callout labels, micro-meta.

### Named Rules
**The Display Reservation Rule.** UI copy stays on Sofia Sans Condensed; Gemunu Libre is reserved for brand, Overview display, and section headlines — not for dense lists or button labels.

## Layout

Operate shell is always **fluid**: left rail `clamp(12rem, 18vw, 16rem)` + scrollable main with `clamp(1rem, 2.5vw, 2rem)` padding on limestone ground. Overview uses a single-column CSS grid (hero → map shell → four-panel strip), max-width ~90rem, centered — no fixed 16:9 absolute stage.

Map shell is a responsive grid: legend full-width, SVG stage + callout side-by-side from ~1100px up; stacks callout under the map below that. Strip is four columns → two → one as the viewport narrows.

Mobile (`max-width: 900px`): rail becomes a horizontal wrap nav (44px min targets); hero and status stack; map and strip stack full-width.

Spacing rhythm stays board-dense: panel padding ~0.75–1rem, list rows ~0.35rem vertical, control gaps ~0.35–0.75rem.

## Elevation & Depth

Hybrid: ivory surfaces sit on limestone ground with soft walnut-tinted ambient shadows; active state uses tonal wash + inset sea-glass rail rather than hard offset drop shadows. The page background may carry quiet radial washes of lamp amber and sea-glass at very low alpha.

### Shadow Vocabulary
- **Panel ambient** (`box-shadow: 0 10px 28px rgba(42, 34, 28, 0.1)`): Standard ivory panels.
- **Map lift** (`0 14px 36px rgba(42, 34, 28, 0.12)`): Overview map shell.
- **Modal** (`0 16px 40px rgba(42, 34, 28, 0.16)`): Skill-check / dialog cards.
- **Hairline** (`0 1px 0 rgba(42, 34, 28, 0.05)`): Non-overview content cards.
- **Active rail** (`inset 3px 0 0 #355E57`): Active nav link and roadmap station mark.

### Named Rules
**The Soft-Walnut Shadow Rule.** Shadows stay warm walnut at low alpha; never black hard offsets or neon glow. Dense bottom strip panels may drop shadow entirely and rely on a 1px border.

## Shapes

Controls and nav links use gently squared corners (**6px**). Dense panels soften to **8px**; standard panels **10px**; map shell **14px**. Line dots, legend swatches, and status pips are full pills (**999px**). Genre filters are pill chips. Focus is a **2px** sea-glass outline with **2px** offset — no glow ring.

## Components

### Buttons
- **Shape:** Gently squared (6px); min-height 44px
- **Primary:** Lamp amber fill, ink-deep type, weight 700, padding `0.55rem 1rem`; hero variant adds uppercase + tracked letter-spacing
- **Hover / Focus:** Slight brightness drop / `translateY(-1px)` on Overview CTAs; focus-visible uses sea-glass outline
- **Secondary:** Ivory fill, ink text, 1px `#C9BEAF` border; hover to field fill

### Chips
- **Style:** Ivory with border; pill radius; Sofia Condensed ~0.875rem
- **State:** Selected → sea-glass border + sea-glass text (genre filters)

### Cards / Containers
- **Corner Style:** Panel 10px; dense strip panels 8px; map shell 14px
- **Background:** Ivory on limestone ground
- **Shadow Strategy:** Soft ambient (see Elevation); dense panels often shadowless with warm border
- **Border:** `#D2C8BA` / soft `#E0D7CB`
- **Internal Padding:** ~0.75–1rem

### Inputs / Fields
- **Style:** Field fill `#EBE4D8`, 1px border, 6px radius, body text
- **Focus:** 2px sea-glass outline + border shift (no heavy glow)
- **Error / Disabled:** Ember clay for error copy; disabled inherits muted

### Navigation
- Left rail on rail mist; links medium weight, transparent default, hover `#E0D8CC`
- Active: `#DDE8E4` wash, sea-glass text, inset 3px sea-glass rail, weight 700
- Mobile: horizontal wrap, min-height 44px
- Stroke icons ~18–20px

### Interactive Corridor Map (signature)
- SVG `viewBox` map that scales fluidly; routes = course phases (colored polylines); stations = lessons (keyboard-focusable buttons)
- States: open / next (lamp-amber ring) / complete (inner ivory dot) / locked (muted disk, `aria-disabled`)
- Side callout shows selected station + primary action (Open lesson / Generate roadmap)
- Empty roadmap: dashed genre preview lines + central “Build your course” action station
- Motion (respects `prefers-reduced-motion`): map settles (`corridor-settle` ~650ms, opacity/scale only), callout boards in (~560ms / 120ms delay) — `cubic-bezier(0.16, 1, 0.3, 1)`

### Roadmap Station
- Station rows use the same inset sea-glass rail as active nav to mark continuity with the corridor grammar

## Do's and Don'ts

### Do:
- **Do** keep Overview led by the interactive corridor map + Resume Practice, with progress/activity as a secondary strip.
- **Do** use sea-glass for active path/nav/focus and lamp amber only for primary CTAs.
- **Do** reserve amber/moss/clay for path/state inks (dots, warns, complete).
- **Do** keep panels ivory on limestone with soft walnut-tinted shadows or flat dense borders.
- **Do** pair Gemunu Libre for brand/display/section titles with Sofia Sans Condensed for UI body and controls.
- **Do** let the map SVG and Overview grid resize with the viewport — no fixed absolute stage.

### Don't:
- **Don't** revive dark-studio neon, purple glow, cool clinical white/cyan shells, or gamified badge stacks.
- **Don't** bury “what’s next” in a card stack that replaces the interactive corridor.
- **Don't** use amber/moss/clay as large brand fills or hero washes.
- **Don't** introduce hard black drop shadows or enamel ticket costume as the default surface language.
- **Don't** put Inter/Roboto/system display faces in place of Gemunu + Sofia Condensed.
- **Don't** fake map chrome (search/tools) that looks interactive but isn’t.
