---
name: Kinetic Industrial Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bfc8cf'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#899299'
  outline-variant: '#3f484e'
  surface-tint: '#7cd0ff'
  primary: '#7cd0ff'
  on-primary: '#00344a'
  primary-container: '#007ba7'
  on-primary-container: '#f5faff'
  inverse-primary: '#00658b'
  secondary: '#ffb0ca'
  on-secondary: '#640035'
  secondary-container: '#e1007f'
  on-secondary-container: '#fffbff'
  tertiary: '#42e18d'
  on-tertiary: '#00391e'
  tertiary-container: '#00844c'
  on-tertiary-container: '#eaffec'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7cd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#ffd9e3'
  secondary-fixed-dim: '#ffb0ca'
  on-secondary-fixed: '#3e001f'
  on-secondary-fixed-variant: '#8d004e'
  tertiary-fixed: '#65fea7'
  tertiary-fixed-dim: '#42e18d'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522d'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.03em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.02em
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
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
  space-2xl: 3rem
---

## Brand & Style
The design system establishes a high-performance, dark-mode telemetric environment tailored for manufacturing floors, mechanical workshops, and IoT facility engineers. The brand personality balances rugged industrial credibility with clinical, scientific precision. It strips away ornamental distraction in favor of density, razor-sharp visual hierarchy, and immediate situational awareness.

The design movement combines **Industrial Minimalism** and **Instrument-Grade Functionalism**. High-contrast data channels allow operators to parse high-velocity vibration waveforms, thermographic trends, and anomaly indicators within split seconds under varied workshop lighting. The interface feels solid, reliable, and mechanical—evoking precision bench instrumentation and modern aviation avionics rather than generic software analytics.

## Colors
The color palette relies on a deep, light-absorbent base punctuated by high-luminance diagnostic accents. 

- **Jet Black (`#0A0A0A`)**: Ground canvas, persistent navigation rails, and low-priority structure.
- **Cerulean Blue (`#007BA7`)**: Primary functional tint, active telemetry paths, nominal graph traces, focus states, and primary interaction triggers.
- **Neon Rose (`#FF2D95`)**: Reserved strictly for critical mechanical anomalies, bearing fault thresholds, emergency stops, and urgent alerts. It is never used decoratively.
- **Healthy Green (`#32D583`)**: Nominal operating parameters, baseline alignment, and certified sensor health.
- **Warning Amber (`#F5B942`)**: Early friction detection, slight harmonic drift, and scheduled inspection windows.
- **Info Slate (`#8B9BB0`)**: Telemetric metadata, inactive states, and contextual tooltips.
- **Surfaces & Architecture**: Structural tiers use Card Surface (`#15171B`) for component isolation, Elevated Surface (`#1D2026`) for overlays/drawers, and Divider Gray (`#30343B`) for low-noise mechanical boundaries.
- **Typography Tiers**: High-visibility Primary Text (`#F5F7FA`) guarantees legible telemetry against dark backgrounds; Secondary Text (`#A6AFBC`) handles units, labels, and contextual timestamps.

## Typography
The typography strategy deploys **Geist** for crisp, modern editorial hierarchy and UI labels, combined with **JetBrains Mono** for all sensor telemetry, numerical readouts, timestamps, and industrial status signals.

- All numeric readouts must enable monospaced tabular figures (`tnum`) to eliminate layout jitter during high-frequency live streaming (e.g., 60Hz acceleration/velocity metrics).
- Labels are rendered in uppercase using `JetBrains Mono` with loose tracking to emulate laser-etched physical control panels.
- Line heights remain strictly condensed across telemetric levels to optimize real estate in complex dashboard grids.

## Layout & Spacing
The layout follows a modular 12-column fluid grid system engineered for multi-monitor factory displays, shop-floor rugged tablets, and control workstations.

- **Breakpoints**: 
  - Mobile (`< 768px`): 4-column layout, full-bleed diagnostic cards, stacked telemetry modules.
  - Tablet (`768px - 1199px`): 8-column layout, split metric displays, collapsible sensor nav.
  - Desktop / Industrial Displays (`1200px+`): 12-column layout with fixed 260px machinery asset tree and persistent live diagnostic stream.
- **Rhythm**: Layout rhythm is pegged strictly to an 8px base grid, using `space-xs` (4px) exclusively for micro-alignments (e.g., status dot to label) and `space-md` (16px) for interior component padding. Cards maintain tight gaps to maximize sensor density without visual clutter.

## Elevation & Depth
Visual hierarchy avoids soft consumer drop shadows, adopting an **Instrument Flat** approach with low-contrast structural boundaries and tonal surface layering:

- **Base Ground (`#0A0A0A`)**: Canvas floor, inactive gutter zones, and global side navigation.
- **Surface Level 1 (`#15171B`)**: Metric cards, gauge panels, baseline charts, and data tables. Outlined by a crisp 1px border of `#30343B`.
- **Surface Level 2 (`#1D2026`)**: Floating tooltips, diagnostic overlays, modal configuration sheets, and dropdown popovers. Bordered by `#30343B` with a tight ambient shadow: `0 8px 24px rgba(0, 0, 0, 0.6)`.
- **Active State Glow**: Focused or alerting modules receive zero blur shadow, using instead a dual 1px outline: inner border tinted with the status hue (`#007BA7` or `#FF2D95` at 50% opacity) and an outer boundary of solid `#30343B`.

## Shapes
The design system employs a restrained **Soft (`1`)** shape language to reinforce the physical, engineered aesthetic of metal hardware enclosures and rack-mounted equipment:

- **Base Components**: Metric cards, inputs, buttons, and alert modules use a strict `0.25rem` (4px) corner radius.
- **Inner Accents**: Gauge tracks, telemetry indicators, status pills, and sparkline plots maintain small, uniform 2px to 4px corners. Circular geometry is reserved strictly for radial gauges and telemetry status dots.
- **Structural Integrity**: Avoid organic shapes, heavy rounds, or pill buttons. Sharp, disciplined edges preserve visual alignment across complex multi-axis telemetry grids.

## Components

### Buttons
- **Primary**: Solid Cerulean Blue (`#007BA7`) background, `#F5F7FA` bold text, 4px radius, 36px height for desktop/44px for touch tablets.
- **Critical / Danger**: Solid Neon Rose (`#FF2D95`) background, `#F5F7FA` text, used exclusively for emergency motor stops and acknowledgment of level-1 alerts.
- **Secondary / Outline**: Transparent fill, 1px `#30343B` border, `#F5F7FA` text; hover transitions to `#1D2026` surface with `#007BA7` border.

### Status Badges & Chips
- Compact, monospaced (`label-sm`), featuring a dual structure: a 6px status LED indicator (pulsing for active critical anomalies) alongside uppercase telemetry text.
- Healthy uses `#32D583` at 15% fill with solid text. Warning uses `#F5B942` at 15% fill. Critical uses `#FF2D95` at 15% fill with a 1px `#FF2D95` border.

### Industrial Metric Cards
- Container built on `#15171B` with a 1px `#30343B` frame.
- Structured header: asset nomenclature (e.g., `MOTOR_PUMP_04B`) in `label-sm`, paired with a status badge.
- Telemetry hero: Current reading in `telemetry-lg` paired with smaller unit designation (e.g., `mm/s RMS`, `°C`, `g pk-pk`).
- Visual baseline: Mini-sparkline or target deviation threshold showing current versus baseline nominal values.

### Gauges & Sensor Telemetry
- Radial and linear bar gauges use a dark `#1D2026` background channel.
- Safe zones are marked with subtle `#30343B` threshold lines; values transitioning past tolerance shift dynamically from Cerulean Blue to Warning Amber and Neon Rose.

### Technical Machine Silhouettes
- High-contrast 2D vector schematics of motors, gearboxes, and pumps rendered in `#8B9BB0` wireframe.
- Overlay sensor nodes pinned directly over bearing positions (DE/NDE), colored according to live sensor health with click-to-filter capability.

### Diagnostic Feeds & Lists
- Dense tabular rows separated by 1px `#30343B` rules.
- Timestamp rendered in `JetBrains Mono` (`#8B9BB0`), root cause hypothesis in `body-sm` (`#F5F7FA`), and severity tag right-aligned. Hover states transition row background to `#1D2026`.

### Form Controls & Inputs
- Text inputs and dropdowns feature `#0A0A0A` fill, 1px `#30343B` stroke, and monospaced text input.
- Checkboxes and radio toggles are square (2px radius) and render a solid Cerulean Blue indicator when selected.