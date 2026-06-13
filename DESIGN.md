# Design

Visual system for the Vire portfolio site. Captured from shipped code
(`styles/base.css`, `styles/components.css`, `scripts/chrome.js`). No build step,
no framework — static multi-page site. Two themes (dark default, light), bilingual RU↔EN.

## Theme

Engineer's terminal at night. Warm dark gray surface (not pure black), a single warm-orange
accent that reads as a CRT/amber-terminal glow, monospace everywhere. Light theme is the same
system inverted to near-white for daytime/print reading. Dark is the canonical brand expression;
light is the accessible alternate. Motion is illustrative (pipelines, a node-graph that "runs"),
never decorative ambience.

## Color

Tokens live in `:root`/`[data-theme="dark"]` and `[data-theme="light"]` in `base.css`.
Strategy: **Restrained** — tinted-neutral surfaces + one saturated accent (orange) carrying
all emphasis. A secondary green marks "live / done / success" states only.

### Dark (default)
- `--bg #1a1a1a` · `--bg-elev #222222` · `--bg-elev-2 #2a2a2a` · `--bg-input rgba(255,255,255,.04)`
- Hairlines: `--line rgba(255,255,255,.08)` · `--line-strong .12` · `--line-emph .20`
- Text: `--text #e5e5e5` · `--text-muted #888888` · `--text-dim #8a8a8a` · `--text-faint #707070`
- Accent (orange): `--accent #E07A41` (decorative) · `--accent-text #E07A41` (text) ·
  `--accent-soft rgba(224,122,65,.12)` · `--accent-line rgba(224,122,65,.30)` · `--accent-pink #f0a06a`
- Green: `--accent-green #4ade80` (decorative) · `--accent-green-text #4ade80` (text)

### Light
- `--bg #fafafa` · `--bg-elev #ffffff` · `--bg-elev-2 #f0f0f0`
- Text: `--text #1a1a1a` · `--text-muted #555555` · `--text-dim #666666` · `--text-faint #6c6c6c`
- Accent text darkened for AA: `--accent-text #B44D1E` (≥5:1) · `--accent-green-text #177c43`

### Contrast rule (critical, project-specific)
Two accent tokens exist on purpose: **decorative** (`--accent`, `--accent-green` — bright on both
themes, for borders/dots/glows and the permanently-dark terminal) and **text-safe**
(`--accent-text`, `--accent-green-text` — darkened on light to pass AA). Never use the bright
decorative accent as text on a light-flipping surface. Permanently-dark surfaces (hero terminal
`#1a1816`, code-card `#1f1d1b`) keep hard-coded warm syntax colors and are theme-independent.

## Typography

- **One family: JetBrains Mono** (self-hosted woff2, weights 400/500/600, all unicode-ranges).
  No second family — weight/size contrast carries hierarchy. Stack:
  `'JetBrains Mono','SF Mono',Monaco,Menlo,monospace`. `font-feature-settings:"ss01","cv11"`.
- Body 14px / line-height 1.6.
- `.display` clamp(36px,7vw,88px), weight 500, letter-spacing −0.035em, line-height 0.98, balance.
- `.headline` clamp(24px,3.8vw,44px), −0.025em. `.title`/case h2 19–24px.
- Kickers: 12px uppercase, letter-spacing 0.08em, `::before { content:'/' }` in accent — a named
  brand motif, not a per-section eyebrow.
- `text-wrap: balance` on headings, `pretty` on prose. Body measure capped ~56–68ch.

## Components

- **Floating pill nav** (`.nav-pill`): fixed, backdrop-blur + `@supports` opaque fallback, brand
  mark + links + theme/lang icon-btns + CTA; collapses to burger + cloned menu < 760px.
- **Hero terminal** (`.hero-terminal`): per-char typewriter, 3D mouse-tilt, scanline overlay, amber glow.
- **Pipeline diagram** (`.pipeline`): staged decision flow, one-shot scroll reveal.
- **Workstation CLI browser** (`.workstation`): file-tree (`div[role=button]`) + JS-rendered detail pane.
- **Node-graph "Integrations"** (`.netmap`): warm SVG cables, flow packets, hover-trace, illustrative
  log, 3D parallax; all gated behind reduced-motion / pointer:coarse and paused off-screen.
- **Tier cards** (`.tier`): pricing, top-accent border, featured scale, hover lift + glow.
- **Testimonials carousel** (`.testimonials`): native scroll-snap + JS dots/autoplay, ARIA carousel.
- **FAQ** (`.faq details`): grid-rows accordion. **Case study**: spec card, console metric-row, PDF mock
  (`role="img"` replica), pullquote, prev/next nav, end-of-case `.case-cta`.
- **Contact form** (`.cform`, pricing only): textarea + contact + budget chips → Worker → Telegram,
  honeypot, mailto fallback.
- Buttons: pill, `.primary` (ink-on-bg), `.secondary`, `.ghost`; min-height 44px on mobile.

## Layout

- `.shell` max-width 1200px (`.narrow` 880), 24px gutter. Sections `.spread` 120px (80 mobile),
  separated by single hairlines.
- Grids commit to explicit columns with one collapse breakpoint (tiers/principles 3→1, feature 2→1,
  case 2-col→1) rather than auto-fit. Breakpoints: 960/900/860/760/720/620/600/560/480.
- `body { overflow-x: hidden }`; integrations graph breaks out right via capped negative margin.
- Radii 12/16/pill. Shadows warm, layered, low-opacity.

## Motion

- Easing `cubic-bezier(0.2,0.8,0.2,1)` (ease-out, no bounce). Reveals animate opacity/transform only.
- Progressive enhancement: `html.js` gates hidden states; without JS all content is visible.
- `@media (prefers-reduced-motion: reduce)` neutralizes every animation; IntersectionObserver pauses
  off-screen graph/SMIL. One-shot reveals (pipeline, workflow, FAQ, timeline) never loop.
