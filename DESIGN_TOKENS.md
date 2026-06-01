# DESIGN_TOKENS.md

Design tokens extracted from the approved Claude Design handoff
(`Недвижемость` — marketing landing + admin panel + student cabinet).

The handoff ships **three stylesheets** that share one brand core but differ in
secondary grays, radii, shadows and body font:

| Area      | Headings        | Body       | Base radii   | Surface   | Grays |
| --------- | --------------- | ---------- | ------------ | --------- | ----- |
| Marketing | Playfair Display | **Manrope** | 10/16/24/32 | `#F5F1EA` | warm  |
| Student   | Playfair Display | **Inter**   | 10/16/24    | `#F5F1EA` | warm  |
| Admin     | Playfair Display | **Inter**   | 8/12/16     | `#FAFAF8` | cool  |

## How it's modeled

- **Shared brand core** (cream / green / gold / ink) → exact hex in
  [`tailwind.config.ts`](tailwind.config.ts).
- **Contextual tokens** (secondary text, lines, surface, radii, shadows, body
  font) → CSS variables in [`app/globals.css`](app/globals.css), overridden per
  area by `.theme-marketing` / `.theme-student` / `.theme-admin` on each route
  group's wrapper.
- **Fonts** are loaded once in [`app/layout.tsx`](app/layout.tsx) via
  `next/font/google` (Cyrillic subset) and exposed as `--font-playfair`,
  `--font-manrope`, `--font-inter`. `--font-sans` points at Manrope by default
  and is switched to Inter inside `.theme-admin` / `.theme-student`.

## Color — brand core (identical everywhere)

| Token        | Hex       | Tailwind          |
| ------------ | --------- | ----------------- |
| Cream        | `#F5F1EA` | `bg-cream`        |
| Cream deep   | `#EFE9DE` | `bg-cream-deep`   |
| Paper        | `#FFFFFF` | `bg-paper`        |
| Ink          | `#1A1A1A` | `text-ink`        |
| Green        | `#2D4A3E` | `bg-green`        |
| Green deep   | `#213A30` | `bg-green-deep`   |
| Green soft   | `#3C6151` | `text-green-soft` |
| Gold         | `#C9A96E` | `bg-gold`         |

## Color — contextual (CSS vars, per area)

| Variable             | Marketing | Student   | Admin     |
| -------------------- | --------- | --------- | --------- |
| `--ink-soft`         | `#4A463F` | `#5B564D` | `#6B7280` |
| `--ink-mute`         | `#8A857B` | `#8A857B` | `#9CA3AF` |
| `--line`             | `#E4DDD0` | `#E4DDD0` | `#E8E4DC` |
| `--line-soft`        | `#EDE7DB` | `#EEE8DC` | `#F0ECE3` |
| `--surface`          | `#F5F1EA` | `#F5F1EA` | `#FAFAF8` |
| `--muted`            | `#EFE9DE` | `#EFE9DE` | `#F5F1EA` |
| `--green-tint`       | `#F0F3F1` | `#EDF1EF` | `#F0F3F1` |
| `--gold-deep`        | `#B8965A` | `#A9863F` | `#B8965A` |
| `--gold-soft`        | `#E2D2B0` | `#F5ECDA` | `#F7F0E3` |

## Status (admin / student)

| Token   | Color     | Soft bg   | Tailwind                        |
| ------- | --------- | --------- | ------------------------------- |
| Success | `#4A7C59` | `#EAF2EC` | `text-success` / `bg-success-soft` |
| Warning | `#D97706` | `#FCF1E2` | `text-warning` / `bg-warning-soft` |
| Error   | `#B33A3A` | `#F8ECEC` | `text-error` / `bg-error-soft`     |
| Info    | `#2563EB` | `#E9F0FD` | `text-info` / `bg-info-soft`       |

## Radii (`rounded-sm/md/lg/xl` resolve per area)

| Token  | Marketing | Student | Admin |
| ------ | --------- | ------- | ----- |
| `--r-sm` | 10px    | 10px    | 8px   |
| `--r-md` | 16px    | 16px    | 12px  |
| `--r-lg` | 24px    | 24px    | 16px  |
| `--r-xl` | 32px    | 24px    | 16px  |

## Shadows

`shadow-e1` / `shadow-e2` / `shadow-e3` (elevation 1–3) + `shadow-gold`.
Marketing/student use warm shadows (`rgba(33,30,24,…)`), admin uses cool
(`rgba(26,26,26,…)`).

## Typography

- Serif (headings everywhere): **Playfair Display** 600, `letter-spacing -0.01em`.
- Sans: **Manrope** (marketing) / **Inter** (admin + student).
- Base size: marketing 17px / student 15px / admin 14px (set on the `.theme-*` wrapper).

## Base components (`components/ui/`)

- `button.tsx` — pill button, variants `green` (default) · `gold` · `outline` ·
  `light` · `ghost` · `danger`; sizes `sm` · `default` · `lg` · `icon`;
  `asChild` for link buttons.
- `input.tsx` — h48 field, 1.5px line border, green focus ring.
- `card.tsx` — Card / Header / Title / Description / Content / Footer.
- `badge.tsx` — pill tag, variants `default` · `gold` · status (`success` …) · `outline`.

All later components build on these. The live token preview is the temporary
home page (`app/page.tsx`, replaced by the real landing in STAGE 4).
