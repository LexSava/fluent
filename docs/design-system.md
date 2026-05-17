# Design System

This document describes the visual design system used in Fluent — CSS custom properties, typography, component styling rules, theme switching, and how to use design tokens in Tailwind classes.

---

## Core Principles

- **Flat and sharp** — minimal border-radius (3–8px), no box shadows. Depth is expressed through borders only.
- **Violet/purple accent** — `#7C6FCD` is the brand color used for interactive elements, focus states, and highlights.
- **Both themes** — dark and light modes are fully supported and toggled without a page reload.
- **Font** — Geist Sans (built into Next.js 14+, loaded via `next/font/google`).
- **Animations** — Framer Motion, subtly applied at 150–200ms. No decorative animations.

---

## CSS Custom Properties

All tokens are defined in `src/app/globals.css` as `:root` (light) and `.dark` selectors.

### Dark Theme (`:root .dark` or `[data-theme="dark"]`)

| Variable           | Value     | Usage                                   |
| ------------------ | --------- | --------------------------------------- |
| `--bg-base`        | `#0D0D10` | Page background                         |
| `--bg-card`        | `#141318` | Card and panel backgrounds              |
| `--bg-elevated`    | `#1E1C2A` | Elevated surfaces (dropdowns, modals)   |
| `--border`         | `#232130` | All borders                             |
| `--text-primary`   | `#F0EEFF` | Headings and primary text               |
| `--text-secondary` | `#9D96C8` | Body text, labels                       |
| `--text-hint`      | `#6B6880` | Hints, placeholders, secondary metadata |

### Light Theme (`:root`)

| Variable           | Value     | Usage                      |
| ------------------ | --------- | -------------------------- |
| `--bg-base`        | `#F5F4FA` | Page background            |
| `--bg-card`        | `#FFFFFF` | Card and panel backgrounds |
| `--bg-elevated`    | `#ECEAF8` | Elevated surfaces          |
| `--border`         | `#DDDAF0` | All borders                |
| `--text-primary`   | `#1A1825` | Headings and primary text  |
| `--text-secondary` | `#534AB7` | Body text, labels          |
| `--text-hint`      | `#8884AA` | Hints, placeholders        |

### Shared (Both Themes)

| Variable         | Value     | Usage                                             |
| ---------------- | --------- | ------------------------------------------------- |
| `--accent`       | `#7C6FCD` | Primary brand color — buttons, links, focus rings |
| `--accent-deep`  | `#534AB7` | Darker accent for hover states                    |
| `--accent-light` | `#A89EE0` | Lighter accent for badges and highlights          |
| `--accent-dim`   | `#1A1825` | Very dark accent for backgrounds                  |
| `--success`      | `#4ADE80` | Success states                                    |
| `--error`        | `#F87171` | Error states                                      |
| `--warning`      | `#FBBF24` | Warning states                                    |
| `--radius-xs`    | `3px`     | Smallest radius (badges)                          |
| `--radius-sm`    | `5px`     | Small radius (buttons, inputs)                    |
| `--radius-md`    | `6px`     | Medium radius (cards)                             |
| `--radius-lg`    | `8px`     | Large radius (modals, panels)                     |

---

## Typography Scale

| Role          | Size    | Weight | Notes                                      |
| ------------- | ------- | ------ | ------------------------------------------ |
| `h1`          | 26px    | 700    | `letter-spacing: -0.03em`                  |
| `h2`          | 18px    | 600    | —                                          |
| `body-em`     | 14px    | 500    | `text-secondary`, for emphasized body copy |
| `body`        | 13px    | 400    | `text-secondary`, standard body text       |
| `hint`        | 11px    | 400    | `text-hint`, labels, metadata              |
| Badges/labels | 10–11px | 600    | Uppercase, `letter-spacing: 0.08em`        |

All text uses Geist Sans. No serif fonts are used anywhere in the application.

---

## Component Styling Rules

### Cards

- Background: `bg-bg-card`
- Border: `1px solid border-border` (using the `--border` token)
- Border-radius: `rounded-md` (6px)
- **No box-shadow**

### Buttons

**Primary:**

- Background: `bg-accent`
- Text: white
- Border-radius: `rounded-sm` (5px)
- Font-weight: 600
- Hover: `bg-accent-deep`

**Secondary:**

- Background: `bg-bg-elevated`
- Border: `1px solid border-border`
- Text: `text-text-secondary`

**Ghost:**

- Background: transparent
- Border: `1px solid border-border`
- Text: `text-accent`

### Inputs

- Background: `bg-bg-card`
- Border: `1px solid border-border`
- Border-radius: `rounded-sm` (5px)
- No shadow
- Focus state: `border-accent` (replaces the default border)

### Chat Bubbles

| Role           | Style                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| AI (assistant) | `bg-bg-card`, `border: 1px`, `border-radius: 2px 8px 8px 8px` (flat top-left corner) |
| User           | `bg-accent`, white text, `border-radius: 8px 2px 8px 8px` (flat top-right corner)    |

The asymmetric radius creates a "tail" effect indicating who sent the message.

### Badges

- Border-radius: `rounded-xs` (3px)
- Border: `1px solid` matching the semantic color
- Background: colored (success, error, warning, accent)
- Text: matching color, uppercase, 10–11px, weight 600

### Stat Cards

- Background: `bg-bg-card`
- Border: `1px solid border-border`
- Border-radius: `rounded-md` (6px)
- Number: 28px, weight 700
- Label: 11px, `text-text-hint`

### Dividers

- `1px solid border-border`
- Opacity: 0.12

---

## Theme Switching via next-themes

The `ThemeProvider` component (in `src/components/layout/ThemeProvider.tsx`) wraps the app with the `next-themes` provider using `attribute="class"`. This means dark mode is activated by adding the `dark` class to the `<html>` element.

Tailwind is configured for class-based dark mode:

```
darkMode: "class"
```

The `ThemeToggle` component in the `Header` calls `setTheme("dark")` or `setTheme("light")`. The theme preference is persisted in `localStorage` by `next-themes` automatically. If no preference is stored, the system preference is used.

To check the current theme in a component:

```typescript
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
```

---

## Using Design Tokens as Tailwind Classes

CSS custom properties are exposed as Tailwind utilities via `@theme inline` in `globals.css`. This allows using the design tokens directly as class names.

### Available Utilities

| Token              | Tailwind class                              |
| ------------------ | ------------------------------------------- |
| `--bg-base`        | `bg-bg-base`                                |
| `--bg-card`        | `bg-bg-card`                                |
| `--bg-elevated`    | `bg-bg-elevated`                            |
| `--border`         | `border-border`                             |
| `--text-primary`   | `text-text-primary`                         |
| `--text-secondary` | `text-text-secondary`                       |
| `--text-hint`      | `text-text-hint`                            |
| `--accent`         | `bg-accent`, `text-accent`, `border-accent` |
| `--success`        | `bg-success`, `text-success`                |
| `--error`          | `bg-error`, `text-error`                    |
| `--warning`        | `bg-warning`, `text-warning`                |
| `--radius-xs`      | `rounded-xs`                                |
| `--radius-sm`      | `rounded-sm`                                |
| `--radius-md`      | `rounded-md`                                |
| `--radius-lg`      | `rounded-lg`                                |

Always use these semantic classes rather than hardcoded Tailwind color classes like `bg-purple-500`. Using semantic tokens ensures the component automatically adapts to dark and light themes.

---

## Rules Summary

- **Never use `box-shadow`** anywhere in the application. Use borders for visual separation.
- **Never use hardcoded color values** in components. Always reference design tokens.
- **Border-radius must come from the scale** (`rounded-xs` through `rounded-lg`). Do not use `rounded-full` for non-circular elements.
- **Animations must use Framer Motion** and target duration of 150–200ms. No CSS `transition` animations on interactive elements.

---

## See Also

- [components.md](./components.md) — How component-level styling is applied
- [architecture.md](./architecture.md) — Where globals.css and the theme setup live
