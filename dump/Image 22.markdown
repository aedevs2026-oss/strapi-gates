---
name: Prestige Academic Portal
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e1'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fb'
  surface-container: '#f0ecf5'
  surface-container-high: '#eae7ef'
  surface-container-highest: '#e5e1ea'
  on-surface: '#1b1b21'
  on-surface-variant: '#4c4451'
  inverse-surface: '#303036'
  inverse-on-surface: '#f3eff8'
  outline: '#7e7482'
  outline-variant: '#cfc2d3'
  surface-tint: '#7d40b1'
  primary: '#40006d'
  on-primary: '#ffffff'
  primary-container: '#5b1a8e'
  on-primary-container: '#cc90ff'
  inverse-primary: '#dfb7ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdbc13'
  on-secondary-container: '#6b4d00'
  tertiary: '#41006b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e1292'
  on-tertiary-container: '#ce8fff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f1daff'
  primary-fixed-dim: '#dfb7ff'
  on-primary-fixed: '#2d004f'
  on-primary-fixed-variant: '#642597'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#fdbc13'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#f2daff'
  tertiary-fixed-dim: '#e1b6ff'
  on-tertiary-fixed: '#2e004e'
  on-tertiary-fixed-variant: '#671f9b'
  background: '#fcf8ff'
  on-background: '#1b1b21'
  surface-variant: '#e5e1ea'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style
The design system is crafted for a premium educational environment, balancing the heritage of an established institution with the modern expectations of digital-native parents. The brand personality is **trustworthy, elegant, and nurturing**. 

The visual style draws heavily from **Corporate Modernism** with a **Material Design 3** influence. It utilizes a layered surface approach where depth is communicated through subtle tonal shifts and soft shadows rather than heavy ornamentation. The interface should feel spacious and calm, reducing the cognitive load for parents managing their children's academic lives. High-quality imagery and premium gradients are used sparingly to highlight achievement and school spirit.

## Colors
The palette is rooted in the school's heritage. **Royal Purple** serves as the primary anchor, conveying authority and excellence. **Gold** is used as a strategic accent for highlights, achievements, and urgent status indicators (like pending fees). 

**Light Lavender** is the foundational surface color, used to create soft containers that separate content without the harshness of pure grey. For data visualization and secondary actions, a lighter variant of purple (#9D59D2) is utilized to maintain monochromatic harmony. Success states should use a soft emerald, while error states remain a classic high-visibility red.

## Typography
This design system utilizes **Be Vietnam Pro** (as a high-fidelity alternative to Poppins) to achieve a modern, geometric, yet friendly aesthetic. 

- **Headlines:** Use Bold or Semi-Bold weights with slight negative letter-spacing to create a "premium editorial" feel.
- **Body:** Standardized at 16px for primary readability, with 14px for secondary metadata.
- **Labels:** Uppercase styling is reserved for high-level categories or section overline text to provide clear hierarchy.
- **Color Application:** Use Royal Purple for primary headings and a deep charcoal (#2D2D2D) for body text to ensure WCAG AA accessibility.

## Layout & Spacing
The layout follows a **4px baseline grid** to ensure mathematical harmony. 

- **Mobile View:** Uses a 2-column or 4-column fluid grid with 20px side margins to accommodate modern edge-to-edge displays.
- **Dashboard Grid:** Primary metrics (Attendance, Grades) should use a 2-column card layout, while broad notices should span the full width.
- **Vertical Rhythm:** A consistent 24px (lg) spacing between major sections and 12px (sm) between related items within a group.

## Elevation & Depth
Elevation is expressed through **Tonal Layers** and **Ambient Shadows**. 

1. **Level 0 (Background):** Pure White (#FFFFFF) or Light Lavender (#F6F2FB).
2. **Level 1 (Cards):** Soft Lavender-tinted white with a subtle 1px stroke (#E0D7ED) and a diffuse shadow: `0px 4px 20px rgba(91, 26, 142, 0.05)`.
3. **Level 2 (Active Elements):** For floating action buttons or pressed cards, the shadow deepens and the blur increases to `0px 8px 30px rgba(91, 26, 142, 0.12)`.

Avoid harsh black shadows. All shadows must be tinted with the Primary Royal Purple to maintain a cohesive, premium atmosphere.

## Shapes
The design system adopts a **Rounded** philosophy. Standard container radius is **20px** (rounded-lg) to evoke a friendly, safe, and modern feeling. 

- **Small Components (Chips/Badges):** Use a pill-shape (full radius).
- **Cards & Input Fields:** Use a 20px radius.
- **Progress Bars:** Use a 12px radius for both the track and the indicator to match the overall softness.

## Components

### Dashboard Grid
A modular set of "At-a-glance" cards. Use gradients for high-priority cards (e.g., a diagonal linear gradient from Primary Purple to Tertiary Purple) with white text. Secondary cards use White surfaces with Purple icons.

### Subject Cards
Horizontal layout featuring a small icon placeholder on the left, the Subject Name in `title-lg`, and the Teacher's Name/Room in `body-md`. Include a subtle right-chevron to indicate interactivity.

### Fee Progress Bars
A custom component using the Gold (#F4B400) for the progress indicator against a Light Lavender track. The total amount and balance should be displayed using `label-lg` for clarity.

### Buttons
- **Primary:** Solid Royal Purple, 20px radius, white text, 56px height for mobile touch targets.
- **Secondary:** Outlined with a 1.5px Royal Purple border, no fill.
- **Accent:** Gold fill with Deep Purple text for "Pay Now" or "Urgent" actions.

### Calendar Layouts
Date markers use a soft circular highlight. The current date is marked with a solid Royal Purple circle, while school holidays use a Gold dot indicator below the date.