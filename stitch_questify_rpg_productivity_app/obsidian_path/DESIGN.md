---
name: Obsidian Path
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#44e2cd'
  on-secondary: '#003731'
  secondary-container: '#03c6b2'
  on-secondary-container: '#004d44'
  tertiary: '#e3c2ff'
  on-tertiary: '#490080'
  tertiary-container: '#d09eff'
  on-tertiary-container: '#6700b0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system establishes a "Gamified High-Productivity" aesthetic, blending the immersive, high-stakes atmosphere of a modern ARPG (Action Role-Playing Game) client with the clinical precision of a professional SaaS application. It is designed for learners who seek a sense of "power" and "advancement" in their daily routines.

The visual style is **Glassmorphic-Brutalist**: 
- **Glassmorphism** provides depth through translucent layers, backdrop blurs, and "inner glows" that mimic magical interfaces.
- **Brutalist** influences appear in the sharp, structural line-work, heavy borders for active states, and a focus on high-information density.

The emotional goal is "Mysterious Empowerment." Users should feel like they are navigating an ancient but technologically advanced codex. Visual cues like runic accents and glowing progress indicators transform mundane tasks into "Quests."

## Colors

The palette is rooted in a deep, "Abyssal" charcoal to provide maximum contrast for neon and metallic accents.

- **Abyssal Background (#0a0a0c):** The foundation of the UI. It is not pure black, but a desaturated obsidian that allows for soft shadow depth.
- **Legendary Gold (#D4AF37):** Used exclusively for XP, currency, and high-tier achievements. It represents value and progress.
- **Vitality Teal (#2DD4BF):** Used for "Success" states, streaks, and health-related completions. It provides a sharp, energetic contrast to the dark background.
- **Corruption Red (#EF4444):** Used for missed tasks, health depletion, and critical warnings.
- **Mystic Purple/Blue (#A855F7 / #3B82F6):** Categorical colors used for different knowledge domains (e.g., Science, Arts) to help users segment their learning path.

## Typography

The typography strategy balances "Runic Futurism" with "Developer Precision."

- **Headlines:** Use **Space Grotesk**. Its geometric, slightly "off-beat" letterforms evoke a technical, futuristic vibe that fits the "client" aesthetic.
- **Body:** Use **Geist**. This provides a highly readable, neutral contrast to the expressive headers, ensuring that long-form educational content remains accessible.
- **Metadata/System Stats:** Use **JetBrains Mono**. Monospaced fonts are used for numerical data (XP values, timers, levels) to reinforce the "system/stat" feel of an RPG dashboard.

All headers should utilize a subtle `text-shadow` (0px 0px 8px) using the text's own color at 30% opacity to simulate a magical glow.

## Layout & Spacing

The design system utilizes a **Fixed Grid** model for desktop to mimic a game client's dashboard, transitioning to a **Fluid Stack** for mobile devices.

- **Desktop Layout:** A 12-column grid with a max-width of 1440px. Panels are grouped into logical "Modules" (Inventory, Quest Log, Stats).
- **Rhythm:** A strict 4px base unit. Component padding should generally be `16px` (4 units) or `24px` (6 units) to maintain a spacious, premium feel.
- **The "Client" Frame:** The outer edges of the viewport are reserved for the primary navigation (Bottom Bar) and global notifications, creating a "contained" experience rather than a scrolling webpage.

## Elevation & Depth

Hierarchy is achieved through **Tonal Translucency** rather than traditional shadows.

- **Base Layer:** The Obsidian background (#0a0a0c).
- **Mid Layer (Cards/Panels):** Surface color is `#ffffff` at 4% - 8% opacity with a `backdrop-filter: blur(12px)`. This creates the "dark glass" effect.
- **Outline Depth:** Every interactive panel must have a 1px solid border. 
    - *Default:* `#ffffff` at 10% opacity.
    - *Active/Hover:* Use a primary color (Gold or Teal) with a `box-shadow: 0 0 15px [color]50` to create a neon-border glow.
- **Z-Axis:** Elements further up the Z-axis (Modals, Hover Tooltips) should have a higher backdrop blur (24px) and a brighter border (20% opacity).

## Shapes

The shape language is a mix of **Technical Geometric** and **Organic Runic**.

- **Containers:** 16px (1rem) rounded corners for all main cards and panels.
- **Interactive Elements:** Buttons and pill-shaped badges use a 99px "Full" radius for a modern, sleek touch.
- **RPG Accents:** Hexagonal shapes are reserved for Level Badges and Skill Tree nodes.
- **Dividers:** Horizontal rules should not be plain lines; use a center-weighted gradient (Transparent -> Primary Color -> Transparent) to mimic a "beam of light."

## Components

### Buttons
- **Primary:** Legendary Gold background, black text. High-contrast. On hover, add an outer glow.
- **Secondary/Ghost:** 1px border of Teal or Gold, transparent background. Text matches border color.

### Progress Bars
- **Container:** Dark charcoal with a subtle inner shadow to look "recessed."
- **Fill:** A linear gradient from a darker hue to the bright accent (e.g., `#B48A1B` to `#D4AF37`). 
- **Effect:** Add a "shimmer" animation—a white highlight that travels across the fill every 3 seconds—to suggest the bar is "charged" with energy.

### Cards
- Always "Dark Glass" style.
- Headers within cards should be separated by a 1px line with 10% opacity.
- Corner details: Use 4px "L-shaped" accents on the corners of active cards to evoke a "target locking" or "UI frame" feel.

### Hexagonal Badges
- Used for character level. The center contains the number in **JetBrains Mono**. The border glows brighter as the user nears a level-up.

### Navigation (Fixed Bottom Bar)
- A floating bar with `backdrop-filter: blur(20px)`.
- Active icons use the "Legendary Gold" color with a vertical glow bar (2px wide) underneath the icon to indicate selection.