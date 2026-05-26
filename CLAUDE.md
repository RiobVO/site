# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static multi-page portfolio site for Elyor (solo backend engineer, Tashkent). No build step, no frameworks — open HTML in browser.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Pages

- **index.html** — Home: hero terminal with typing animation, featured Credit Assistant with pipeline diagram, CLI project browser (workstation), principles, process timeline, integrations, contact
- **services.html** — Pricing: three tiers (Consultation, Development, Audit), workflow, FAQ
- **cv.html** — Resume with print stylesheet
- **404.html** — Error page
- **case/*.html** — 6 case studies: credit-assistant, container-bot, serviceflow, support-bot, manicure-bot, pekarna-bot

## Architecture

Three CSS files, one JS file, shared across all pages:

- **styles/base.css** — CSS custom properties (design tokens), typography, buttons, nav, layout, reveal animations, code-card styles. All colors defined as `--accent`, `--bg`, `--text-*`, `--line-*` variables in `:root` and `[data-theme="light"]`.
- **styles/components.css** — Page-specific components: hero terminal, workstation CLI browser, pipeline diagram, tier cards, workflow, FAQ, case study layouts (spec card, metrics, pullquote, case-nav), CTA, footer, process timeline, integrations.
- **styles/print.css** — CV print/PDF optimization (A4, no color).
- **scripts/chrome.js** — Theme toggle (`elyor.theme` in localStorage), language cycle RU↔EN (`elyor.lang`), IntersectionObserver for `.reveal` elements, FAQ smooth accordion, cursor-following glow on `.tier` and `.work-card`, hero terminal typing animation, case study code-card typing animation (`initCaseTyping`).

## Design system

- **Font**: JetBrains Mono everywhere (body, headings, code, UI). Only font. No Cormorant, no sans-serif.
- **Dark theme** (default): bg `#1a1a1a`, text `#e5e5e5`, accent `#E07A41` (orange).
- **Light theme**: bg `#fafafa`, text `#1a1a1a`, same orange accent.
- **No gradient text** — `.accent-gradient` uses solid `color`.
- **No aurora glow, no grid overlay** — clean solid backgrounds.
- **Kickers** use `/` prefix (CSS `::before { content: '/'; }`).
- **Code blocks** (`.code-card`): warm dark bg `#1f1d1b`, macOS window dots via CSS `::before`, syntax colors for `.key`, `.str`, `.num-c`, `.kw`, `.prompt`.
- **Favicon**: `[><]` symbol in SVG, orange on dark.

## Key UI components

- **Hero terminal** (`#hero-term`): typing animation with per-character typewriter effect, 3D tilt on mouse, ambient glow. Commands deploy each project.
- **Workstation CLI browser** (`.workstation`): file tree left, project detail right. JS-generated from `WS_PROJECTS` array. Cascade animation on project switch.
- **Case study typing** (`#caseTyping`): last output in each case's code-card types character by character on scroll, with blinking `|` cursor that stays.
- **Case spec card** (`.case-spec`): interactive rows with hover highlight, values turn orange on hover.
- **Case nav**: simple prev/next with orange underline animation on hover.

## i18n

Bilingual RU↔EN. Content blocks wrapped in `<span data-lang="ru">` and `<span data-lang="en">`. CSS hides non-active: `[data-lang]:not(.active) { display: none; }`. JS cycles RU↔EN via `[data-lang-cycle]` button. No UZ.

Dynamic content (workstation CLI browser) must call `applyLang()` or manually toggle `.active` on created `data-lang` spans after DOM insertion.

## Contacts

- Email: eleru340@gmail.com
- Telegram: @plssog
- GitHub: RiobVo
- LinkedIn: placeholder (not set yet)

## TODO

- [ ] Git init + push to GitHub
- [ ] Deploy to Cloudflare Pages
- [ ] OG images: URLs are relative (`og/home.png`). After deploy, update to absolute URLs (`https://domain.com/og/home.png`) in all og:image and twitter:image meta tags across all 10 HTML files. Required by OG spec for reliable social previews.
- [x] ~~LinkedIn URL~~ — removed from CV, hidden from nav
- [x] ~~Phone in CV~~ — updated to real number
- [x] ~~Case study CSS improvements~~ — typing animation, metrics scroll-reveal, figure redesign done
- [x] ~~Metrics section~~ — console dashboard style with gauge bars
- [x] ~~Dead CSS cleanup~~ — removed ~1100 lines of unused components
