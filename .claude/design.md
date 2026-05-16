# Design system

### Core principles
- Both dark and light themes via next-themes (system default)
- Flat and sharp style: minimal border-radius (4–6px), no shadows, borders instead
- Accent: violet/purple #7C6FCD (Figma/Twitch style)
- Font: Geist Sans (built into Next.js 14+)
- Animations: framer-motion, subtle and fast (150–200ms)

### CSS tokens (defined in globals.css as :root and .dark)

Dark theme:
  --bg-base: #0D0D10
  --bg-card: #141318
  --bg-elevated: #1E1C2A
  --border: #232130
  --text-primary: #F0EEFF
  --text-secondary: #9D96C8
  --text-hint: #6B6880

Light theme:
  --bg-base: #F5F4FA
  --bg-card: #FFFFFF
  --bg-elevated: #ECEAF8
  --border: #DDDAF0
  --text-primary: #1A1825
  --text-secondary: #534AB7
  --text-hint: #8884AA

Shared (both themes):
  --accent: #7C6FCD
  --accent-deep: #534AB7
  --accent-light: #A89EE0
  --accent-dim: #1A1825
  --success: #4ADE80
  --error: #F87171
  --warning: #FBBF24
  --radius-xs: 3px
  --radius-sm: 5px
  --radius-md: 6px
  --radius-lg: 8px

### Component rules
- Cards: bg-card, 1px solid border, border-radius 6px, no shadow
- Buttons primary: background accent, white text, radius 5px, font-weight 600
- Buttons secondary: bg-elevated, border 1px, text-secondary
- Buttons ghost: transparent, border 1px, accent text
- Chat bubble AI: bg-card, border 1px, border-radius 2px 8px 8px 8px
- Chat bubble User: background accent, white, border-radius 8px 2px 8px 8px
- Badges: border-radius 3px, 1px border, colored bg + matching text
- Inputs: bg-card, border 1px, radius 5px, no shadow, focus: border accent
- Stat cards: bg-card, border 1px, radius 6px, number 28px/700, label 11px/hint
- Dividers: 1px solid border, opacity 0.12
- NO box-shadow anywhere — use borders for depth

### Typography scale
- h1: 26px / 700 / letter-spacing -0.03em
- h2: 18px / 600
- body-em: 14px / 500 / text-secondary
- body: 13px / 400 / text-secondary
- hint: 11px / 400 / text-hint
- badges/labels: 10–11px / 600 / uppercase / letter-spacing 0.08em

### Tailwind utilities (via @theme inline in globals.css)
- bg-bg-base, bg-bg-card, bg-bg-elevated
- bg-accent, text-accent, border-accent
- text-text-primary, text-text-secondary, text-text-hint
- rounded-xs (3px), rounded-sm (5px), rounded-md (6px), rounded-lg (8px)
- bg-success, bg-error, bg-warning
