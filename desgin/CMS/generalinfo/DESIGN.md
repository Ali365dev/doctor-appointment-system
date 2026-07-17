---
name: Clinical Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for professional specialist healthcare, blending the systematic rigor of Stripe with the refined, human-centric aesthetics of Apple. It targets high-end medical practitioners who require a digital presence that signals clinical authority, technical excellence, and patient-first empathy.

The visual style is **Modern Corporate** with **Glassmorphic** accents. It prioritizes clarity through generous whitespace (negative space as a functional tool), a restrained but confident color palette, and high-contrast typography. The emotional response should be one of "calm reliability"—the UI stays out of the way of critical information while maintaining a premium, polished feel that differentiates the specialist from generic medical platforms.

## Colors
This design system utilizes a high-clarity palette rooted in "Medical Blue." The **Primary Blue** is used for critical actions and brand identity, while the **Secondary Blue** provides softer accents for information hierarchy. 

The background employs a very subtle **Slate-tinted Light Gray** to reduce screen glare and provide a sophisticated canvas for **Surface White** cards to pop. Functional colors (Success, Warning, Danger) are calibrated for high legibility against the light background, ensuring patient status and alerts are immediately recognizable.

## Typography
The typography relies exclusively on **Inter** to achieve a systematic, "Apple-esque" functional beauty. Headlines are bold and tightly tracked to create a sense of modern authority. Body text uses a slightly more generous line height to ensure maximum readability for patient instructions and clinical notes.

High contrast is maintained by using the deep Slate text color against white surfaces. For secondary information, use 60% opacity of the primary text color rather than a different hex code, maintaining a cohesive tonal range.

## Layout & Spacing
The layout follows a **12-column Fixed Grid** on desktop, transitioning to a fluid single-column on mobile. The spacing rhythm is based on an 8px scale, but "generous whitespace" is the guiding principle. 

- **Desktop (1280px+):** 12 columns, 24px gutters, 80px side margins.
- **Tablet (768px - 1024px):** 8 columns, 20px gutters, 40px side margins.
- **Mobile (Below 768px):** 4 columns, 16px gutters, 20px side margins.

Content should be grouped in clear logical sections with `xl` (64px) vertical padding to prevent the interface from feeling "crowded"—a critical factor in reducing user anxiety in medical contexts.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Shadows**, avoiding heavy gradients. 

1.  **Level 0 (Base):** Background color (#F8FAFC).
2.  **Level 1 (Cards):** Surface White with a 1px border (#E5E7EB) and a very soft, diffused shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
3.  **Level 2 (Modals/Popovers):** Higher elevation with a larger blur: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`.
4.  **Glassmorphism:** Navigation bars and sticky headers should use a backdrop filter (`blur(12px)`) with a 70% opaque white background to maintain context of the content scrolling underneath, reminiscent of iOS.

## Shapes
The shape language is "Soft-Modern." Use a standard corner radius of **16px** for cards and large containers to evoke a friendly, approachable feel. Small components like buttons and input fields should use **8px** (Level 1) or **pill-shaped** (Level 3) for specific tags/chips to differentiate them from structural layout elements.

## Components
- **Buttons:** Primary buttons use a solid Primary Blue fill with white text. Secondary buttons use a white background with a 1px border (#E5E7EB) and Primary Blue text. Hover states should involve a subtle darkening of the color or a slight lift (shadow increase).
- **Inputs:** Modern "shadcn" style. 1px border, 8px radius. On focus, the border changes to Primary Blue with a 2px outer "glow" (ring) of Primary Blue at 20% opacity.
- **Cards:** The core of the UI. 16px corner radius, white background, and Level 1 elevation. Use internal padding of 24px (md).
- **Chips/Badges:** For medical tags (e.g., "Available", "Specialist"). High-rounded (pill), using light tinted backgrounds (10% opacity of the functional color) with full-strength text color.
- **Lists:** Clean, borderless lists with 1px dividers. Each row should have a subtle hover state (background: #F1F5F9).
- **Data Visualization:** Use Secondary Blue and Success Green for charts. Lines should be smooth (monotone) rather than jagged.