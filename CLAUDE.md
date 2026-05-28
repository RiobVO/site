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
- **services.html** — Pricing: three tiers (Consultation, Development, Audit). `§ 03 · Аудит` tier links to `audit.html` for full landing
- **audit.html** — Audit landing: hero + 5-step scope (workflow style) + report format with sample problem-map code-card + price tier + 3-field mailto form (stack / pain / contact) + Telegram fallback
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

## Credit Assistant — flagship case notes

Real product (public repo: https://github.com/RiobVO/credit-assistant) — SME loan scoring sold and live at a commercial bank in Uzbekistan (NDA on the bank name). Two more financial institutions in talks. Use these notes when editing `case/credit-assistant.html`:

- **Positioning**: "продано и работает в банке (NDA)" — NOT "pre-demo", NOT "pilot kicking off". Don't mention production telemetry as unknown.
- **Voice**: plain language for the widest portfolio audience. NOT a banking-CTO whitepaper. No `BorrowerSnapshot`, `FiringEvidence`, `kpi_calculator.py`, `ScoringService`, ADR-0024, Murodov 2025, BCBS d424, FATF Recommendations, [норматив], [норматив], append-only, brand-scoped, degraded-aware, etc.
- **Real facts** (verified against repo):
  - 24 red-flag rules in 5 categories: financial 12, counterparty 5, payment 3, structural 3, meta 1
  - 8 KPIs (separate path): ebitda, debt_to_ebitda, current_ratio, working_capital, interest_coverage, dscr, quick_ratio, fx_exposure_ratio
  - Real rule slugs: `DSCR_LOW` (threshold 1.3), `VAT_ESF_MISMATCH`, `DIRECTOR_CHANGED_6M`, `LOW_MARGIN_HIGH_TURNOVER`, `WC_INSUFFICIENT` (NOT `CURRENT_RATIO_LOW`), `LOAN_TO_REVENUE_RATIO` (NOT `LOAN_TO_REVENUE`), etc.
  - Decisions: `APPROVE / REVIEW / REJECT` (NOT B+/A/C). Score boundaries < 15 / 15-29 / ≥ 30.
  - Case-ID format: `BR-YYYY-NNNN` (NOT `APP-YYYY-MM-NNNN`)
  - PDF: WeasyPrint only (NO ReportLab, NO pypdf), Inter + JetBrains Mono fonts bundled with licenses
  - Input adapters: `soliq_xltx` (5 forms: form1, form2, profit_tax, vat_decl, vat_ilova) + `esf_csv` + `gnk_certificate`
  - Two modes via `APP_MODE` env: bank (full, LDAP+TOTP) + accountant (validation/outreach)
  - 8.5/10 architecture audit. 1310 tests (per README, proxy — not CI-verified)
  - 2-4 часа → 8-20 минут baseline (NOT "2 дня → 40 мин")
  - 0.75s PDF render — single demo measurement, NOT production p95
- **What's expressly OFF the case** (Phase B+ rebuild decision):
  - Three-way AI reconcile / ADR-0024 verification section — DELETED per user request ("какие нахуй AI?")
  - Code-card with DSCR rule Python code — REMOVED (too technical)
  - Test-listing code-card with pytest output — REMOVED
  - Latency bars SVG (p50/p95/p99) — REMOVED (not measured in prod)
- **PDF mock (Рис. 3)** replicates the real product layout (user-provided screenshot): blue brand (#265dbd), CA badge, Кредитный меморандум header, gauge with red→amber→green arcs and needle at 79, large "К пересмотру" orange recommendation, Ключевые наблюдения section with two columns (Сильные стороны green border + Зоны риска red border). EN caption explains: "Real product ships in RU + UZ — no English version was commissioned by the bank".
- **TOC sections** (after Phase B+ rebuild): § 01 О чём проект · § 02 Как устроено · § 03 Что было сложно · § 04 Цифры · § 05 Что я вынес. NO § Verification methodology.

## TODO

- [ ] Git: commit Phases 1-3 (audit page, credit-assistant rebuild, scan-anchors) — currently all in working tree
- [ ] `og/audit.png` (1200×800) — TODO placeholder in `audit.html`. Style: dark `#1a1a1a`, orange `#E07A41` accent, "Technical Audit" text. Generate by analogue with other `og/*.png`
- [ ] Sync `index.html` featured-block teaser numbers with credit-assistant case (currently shows `1310 tests · 87.4% coverage · 8.5/10` — coverage% was removed from case as unverified)
- [ ] Hero terminal on `index.html` line `coverage 87.4%` — same: drop or replace
- [ ] Deploy to Cloudflare Pages
- [ ] OG images: URLs are relative (`og/home.png`). After deploy, update to absolute URLs (`https://domain.com/og/home.png`) in all og:image and twitter:image meta tags across all 11 HTML files (incl. `audit.html`)
- [ ] Real masked PDF preview screenshot (800×1000) — replace `.pdf-mock` CSS block with `<img src="../og/credit-assistant-pdf-masked.png">` once exported from the actual product
- [ ] `docs/compliance/security-architecture.md:251,349` in credit-assistant repo — clean leftover `[норматив]` mentions in HTML comments BEFORE making the case study public (audit flag)
- [x] ~~Phase 1 — Audit page + dual CTA~~ — `audit.html` created, nav updated across 10 pages, hero + #contact dual CTA on index, services tier-3 CTA → audit
- [x] ~~Phase 2 (B+ rebuild) — Credit Assistant case~~ — rewritten in plain language, real facts from repo, PDF mock replicates real product layout, AI verification section removed per user
- [x] ~~Phase 3 — Scan-anchors~~ — `strong.num` highlight on numbers across 5 cases (credit, pekarna, container, manicure, support); inline-bold → H3 in pekarna §03
- [x] ~~LinkedIn URL~~ — removed from CV, hidden from nav
- [x] ~~Phone in CV~~ — updated to real number
- [x] ~~Case study CSS improvements~~ — typing animation, metrics scroll-reveal, figure redesign done
- [x] ~~Metrics section~~ — console dashboard style with gauge bars
- [x] ~~Dead CSS cleanup~~ — removed ~1100 lines of unused components
