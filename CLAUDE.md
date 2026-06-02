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

> Live pages: **index.html · services.html · 404.html · case/\*.html** (6 cases). There is **NO resume page** (cv.html removed) and **NO audit landing** (audit.html removed) — both deleted by client decision, do NOT recreate either (details in the ⚠️ notes below).

- **index.html** — Home: hero terminal with typing animation, featured Credit Assistant with pipeline diagram, CLI project browser (workstation), **testimonials carousel** (5 real reviews), principles, process timeline, integrations, contact
- **services.html** — Pricing: three tiers (Consultation, Development, Audit). `§ 02` has `id="02"`, `§ 03 · Аудит` has `id="03"` (deep-link targets). Audit is sold here as a tier — NO separate landing page anymore.
- **404.html** — Error page
- **case/*.html** — 6 case studies: credit-assistant, container-bot, serviceflow, support-bot, manicure-bot, pekarna-bot. Each ends with a `.case-cta` block (Telegram + contextual link: bots → `services.html#02`, code-quality cases → `services.html#03`).

**⚠️ audit.html DELETED** (client decision): the dedicated audit landing was removed — the audit service lives only as `§ 03` tier on services.html. All "Запросить аудит"/"Аудит кода" CTAs point to `services.html#03`. Do NOT recreate audit.html. The "Аудит" nav item was also removed (nav is Работы · Услуги · Принципы).

**⚠️ cv.html DELETED** (client decision): the resume page was removed — no CV page, no "Резюме" button (the «Кто я» block links via terminal command-links to github/telegram/email), no CV nav item. `styles/print.css` (CV-only print stylesheet) was deleted as orphaned, and the `cv.html` entry removed from `sitemap.xml`. Do NOT recreate cv.html or print.css.

## Architecture

Two CSS files, one JS file, shared across all pages:

- **styles/base.css** — CSS custom properties (design tokens), typography, buttons, nav, layout, reveal animations, code-card styles. All colors defined as `--accent`, `--bg`, `--text-*`, `--line-*` variables in `:root` and `[data-theme="light"]`. **`--accent-text`** = text-safe accent: `#E07A41` on dark, darkened `#B44D1E` on light (5.00:1 on `#fafafa`, 5.22:1 on `#fff`, 4.58:1 on `#f0f0f0` — passes WCAG AA on every elevated surface incl. open FAQ / hover cards) — used in `.kicker::before`, `.accent-gradient`, link colors, focus outlines (`:focus-visible`), every text/icon accent on light-flipping surfaces (pipeline, workstation, tiers, FAQ, case body, metrics). Decorative `--accent` stays bright on both themes (borders, dots, glows, brand logos, hero-terminal text which sits on a permanently-dark `#1a1816`). Skip-link uses dark text on `var(--accent)` (theme-independent 5.83:1). **`--accent-green-text`** is the same pattern for green TEXT: `#4ade80` on dark (unchanged), `#177c43` on light (5.03:1) — used for status badges / metric `em` / `.ws-badge.live` text; decorative green dots/backgrounds keep bright `--accent-green`. Light-theme muted greys are AA-tuned: `--text-dim #666666`, `--text-faint #6c6c6c` (both ≥4.5:1 incl. on `#f0f0f0`). **A11y invariants:** headings stay sequential (no `h2→h4` skips — principles/timeline/workflow use `h3`); the workstation tree is `div`/`div[role=button]` (NOT `ul`/`li`); the case PDF mock is `role="img"` (visual replica, not audited as text). Lighthouse a11y target ≥98 on light theme — do NOT reintroduce bright `--accent`/`--accent-green` as text on light-flipping surfaces.
- **styles/components.css** — Page-specific components: hero terminal, workstation CLI browser, pipeline diagram, tier cards, workflow, FAQ, case study layouts (spec card, metrics, pullquote, case-nav), **testimonials carousel** (`.testimonials`/`.t-track`/`.proof-quote`), **`.case-cta`** (end-of-case CTA block), CTA, footer, process timeline, integrations.
- **scripts/chrome.js** — Theme toggle (`elyor.theme` in localStorage), language cycle RU↔EN (`elyor.lang`), IntersectionObserver for `.reveal` elements, FAQ smooth accordion, cursor-following glow on `.tier` and `.work-card`, hero terminal typing animation, case study code-card typing animation (`initCaseTyping`), **testimonials carousel** (`initTestimonials`). **First line sets `document.documentElement.classList.add('js')`** for the progressive-enhancement gate.

## Progressive enhancement (no-JS)

`chrome.js` adds `.js` to `<html>` on load. CSS gates hidden states on it so the page is never blank without JS:
- `html:not(.js) .reveal { opacity:1 }` and `html:not(.js) .term-line { opacity:1 }` — content visible without JS.
- `html:not(.js) [data-lang="ru"] { display:revert }` — without JS, RU shows by default (else `[data-lang]:not(.active)` would hide ALL text).
- `prefers-reduced-motion` resets `.reveal`/`.term-line` opacity.
- Workstation has a `<noscript>` fallback list; testimonials carousel degrades to native scroll.
- Do NOT add `defer` to chrome.js without an anti-FOUC inline (theme/lang apply synchronously).

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
- **Testimonials carousel** (`.testimonials[data-carousel]`, index.html only, before #contact): native CSS scroll-snap, 3 cards/row (2 on tablet, 1 on mobile). JS (`initTestimonials`) adds dot indicators + 5s autoplay with ping-pong direction (no jump-loop), pauses on hover, respects reduced-motion. Cards (`.proof-quote`): ★★★★★ stars, quote, avatar-initial + name + role. Dark-premium: top accent edge, watermark quote, hover lift+glow, equal height (`align-items:stretch` + centered quote). 5 reviews — see "Testimonials" below.
- **Case study typing** (`#caseTyping`): last output in each case's code-card types character by character on scroll, with blinking `|` cursor that stays.
- **Case spec card** (`.case-spec`): interactive rows with hover highlight, values turn orange on hover.
- **Case nav**: simple prev/next with orange underline animation on hover.

## Testimonials (5 real reviews — index.html only)

All real, client-provided. Do NOT fabricate reviews or pass invented text as someone's voice (client rejected fakes; for fintech audience a fake = trust death). Bank (credit-assistant bank mode) stays anonymous under NDA — public voices are the client/accountant mode.

1. Ихтиёр Окбоев — главбух ООО «Qadr don non savdo», Ташкент → pekarna-bot
2. Саидамирхужа — Terminal Grand → container-bot
3. Баходир Фозилов — финансист → credit-assistant (text personally confirmed)
4. Покупатель решения (anon) — скоринг МСБ → credit-assistant
5. Команда заказчика (anon) — таск-трекер ServiceFlow, NO case link (case is positioned as open reference, not a client project — linking would contradict)

Possible 6th: Ихтиёр about credit-assistant as accountant — awaiting his real words. Reviews were on services.html too but removed (client decision — no duplication).

## i18n

Bilingual RU↔EN. Content blocks wrapped in `<span data-lang="ru">` and `<span data-lang="en">`. CSS hides non-active: `[data-lang]:not(.active) { display: none; }`. JS cycles RU↔EN via `[data-lang-cycle]` button. No UZ.

Dynamic content (workstation CLI browser) must call `applyLang()` or manually toggle `.active` on created `data-lang` spans after DOM insertion. Testimonials use static `data-lang` spans (no JS re-apply needed). Anonymous review authors/roles are bilingual `data-lang` pairs; named authors (Ихтиёр, Саидамирхужа, Баходир) are language-neutral.

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

## Аудит сайта — завершён (77/77)

Первичный аудит сайта закрыт полностью (**77/77**). Рабочий лог `AUDIT.md` (был gitignored + не деплоился) **ретайрим** — больше не ведём; дальше работаем по «Roadmap → 10/10» ниже. Ключевое из аудита, что важно помнить:
- **#16** «Кто я» terminal whois-card (portrait `img/me.jpg` + plain RU/EN bio + `$ whoami` + github/telegram/email command-links + scroll typing) — только на index.html (убрана с services по решению клиента).
- **#28** «8.5/10» — без атрибуции: банки клиента хотят анонимности (NDA), источник/тип НЕ раскрывать; «внешний/независимый аудит · 8.5/10» оставить как есть, не реоткрывать.
- N/A: #8, #9, #45, #49 (ссылались на удалённую audit.html).

## Key facts (post-audit state)

- **Deploy domain:** `vire.dev` — собственный домен (Cloudflare Registrar, ~$12/год, авто-продление), подключён как **Custom Domain** к Worker `site`. Baked into og:url / canonical / sitemap.xml / robots.txt / JSON-LD `url` — **find-replace со старого `site.versage1998.workers.dev` УЖЕ выполнен** (2026-06-03), в коде старого домена нет. Старый `*.workers.dev` адрес владелец отключает тумблерами Worker URL / Preview URLs в дашборде. Деплой теперь **Worker + Assets**, не чистая статика (см. «Контактная форма» ниже).
- **Fonts self-hosted:** `styles/fonts/*.woff2` (JetBrains Mono 400/500/600, all unicode-ranges) + `@font-face` in `base.css`. NO Google Fonts CDN — the site loads **zero third-party resources**. Do NOT re-add `googleapis`/`gstatic` links.
- **`_headers`** (repo root) ships CSP/HSTS/X-Content-Type-Options/Referrer-Policy/frame-ancestors + long-cache for fonts. Verified only on deploy (`curl -I`).
- **Gitignored:** `AUDIT.md`, `.claude/` (never tracked). Public repo history was rewritten to purge NDA tokens — **never put NDA data in any tracked file** (CLAUDE.md is public).
- **Home additions this audit:** email fallback button, 6-step process (added "Договор · 50% предоплата"). NOTE: mid-page CTA and pre-contact price anchor were added during the audit but later REMOVED by client decision (price page already exists; mid-CTA duplicated hero/contact) — do NOT re-add; their CSS (`.mid-cta`/`.price-anchor`) was deleted.

## Roadmap → 10/10 — ЗАКРЫТ (все 3 фазы исчерпаны)

Внешний Roadmap из 3 фаз пройден насквозь — реальных правок в код не дал (сайт уже близок к 10/10; шаблонное ревью без учёта контекста). **Не воссоздавать ни одну из фаз:**
- **Фаза 1 (блок «болей» / «приходите если»)** — ОТВЕРГНУТА: вайб инфобизнеса, против premium/linear-тона; аудитория тёплая/реферальная уже знает, чего хочет. Не добавлять блоки болей (детали в памяти `feedback-design-preferences`).
- **Фаза 2 (реальный скрин меморандума как визуальный пруф)** — уже закрыта CSS-репликой `.pdf-mock` в `case/credit-assistant.html` (точная маскированная копия; вектор+адаптив+dark/light сильнее растрового скрина того же документа). Реальный скрин дублирует — не нужен.
- **Фаза 3 (тотальная унификация CTA в «Обсудить проект»)** — не нужна: тексты кнопок контекстны намеренно (шапка «Связаться», hero «Обсудить проект», case-cta «Написать в Telegram», #contact буквальные Telegram/email). Унификация в одну фразу роботизирует. EN-артикль `Discuss project` на тарифе Development оставлен сознательно (косметика).

## TODO

- **Deploy is AUTOMATIC** — Cloudflare git integration: a push to `master` rebuilds and redeploys the site automatically. NO manual `npx wrangler deploy`. After each push verify on the live URL: `curl -I .../CLAUDE.md` → 404, `.../AUDIT.md` → 404, `.../.git/config` → 404, `.../cv.html` → 404; `.../sitemap.xml` + `.../robots.txt` → 200; CSP/HSTS present in response headers. (Relies on `.assetsignore` being honored by the git build — the CLAUDE.md→404 check confirms it.)
- [x] **#16 about-me block** — done: «Кто я» terminal whois-card on index.html only (removed from services); portrait `img/me.jpg` (client photo as-is, no surname), bio via humanizer, command-links github/telegram/email (Резюме button + cv.html removed by client). Stylised-duotone variant rejected — original photo kept.
- [x] **#28 «8.5/10» attribution** — resolved: kept unattributed. Client banks want anonymity (NDA) — do NOT name or hint the auditor/bank. Leave «внешний/независимый аудит · 8.5/10» as-is. Do NOT reopen.
- [x] **Интеграции — нод-граф «карта системы»** — done: радиальный `integrations-viz` заменён нод-графом на `index.html` (CSS `.netmap`/`.nm-*` в `components.css`, JS `initNetmap` в `chrome.js`). `_test-nodegraph.html` удалён. Финальные решения:
  - **Заголовок универсальный:** «Пусть системы <span accent>говорят друг с другом.</span>» (продукты — в графе/буллетах, не в заголовке).
  - **Раскладка:** заголовок+текст+галочки СЛЕВА по краю `.shell` (ритм страницы), граф уходит ВПРАВО в gutter через capped `margin-right` (суммарно до ~1340px, запас 24px — без горизонтального скролла). Симметричный breakout всей секции на 1340 ОТВЕРГНУТ (уводил заголовок левее соседних секций). 2 колонки только `≥1180px`, ниже — 1 колонка.
  - **Провода — герой:** тёплый видимый «кабель» (`rgba(224,122,65,0.20)`, НЕ серый — иначе узлы читаются как плавающие карточки) + поток со свечением + кометы-пакеты. Это была единственная реальная слабость графа.
  - **Ядро-герой — ПЛОТНОЕ непрозрачное** (`linear-gradient(orange-tint), var(--bg-elev-2)`, провода уходят ЗА него). Глубина — нейтральной тенью + тонким контуром `0 0 0 1px`. **Большое радиальное свечение-ореол позади ядра ОТВЕРГНУТО** («просвечивает»). Внутри — статичная `queue · outbox · retry`, без вечной анимации.
  - **Живое — только осмысленное:** hover-трассировка (провод узла горит, чип-протокол, остальные гаснут); draw-in на старте (`.armed/.run`); поток-импульсы; лог снизу + вспышка-результат у узла + синхронная вспышка его провода (`.epulse`); 3D-параллакс на мышь. Лог/вспышки иллюстративны. **Баг-фикс:** параллакс замирает на время `.tracing` (иначе сцена ездит под курсором → дребезг чипов). Всё за `reduced-motion`/`pointer:coarse`; вне экрана — пауза (#67). Узкие экраны: `overflow-x:auto` (граф смахивается, не обрезается).
  - **ОТВЕРГНУТАЯ альтернатива:** «живой лог обмена» (tail-f консоль транзакций вместо графа) — владелец сказал граф «намного круче», лог не зашёл. НЕ предлагать замену концепции графа — дорабатывать граф.
  - **Принцип на будущее:** движение только осмысленное; декоративную вечную анимацию и glow-ореолы владелец не любит («перебор»/«просвечивает»).
- [x] **Custom domain `vire.dev`** — DONE (2026-06-03): куплен на Cloudflare Registrar, подключён как Custom Domain, find-replace выполнен везде. Осталось владельцу — отключить тумблеры старого `*.workers.dev`.
- [ ] `docs/compliance/security-architecture.md:251,349` in credit-assistant repo — clean leftover `[норматив]` before making that case public.
- [ ] Реальный замаскированный скрин (PDF/бот/админка) → **Roadmap Фаза 2** (нужен файл от владельца; слот делаю я).

### Done — audit essentially complete (75/77)
- **Security:** NDA leak closed both vectors — `.assetsignore` (deploy) + git history rewritten & force-pushed (public repo, NDA purged); `_headers` (CSP/HSTS); self-hosted fonts → zero third-party requests.
- **SEO/social:** absolute og + og:url + canonical + og:locale + twitter:description; JSON-LD (Person/ProfessionalService/CreativeWork); robots.txt + sitemap.xml; unified nav across all pages.
- **A11y/perf:** skip-links + `id=main`, `:focus-visible`, keyboard nav (tree/principles/Escape, scoped arrows), ARIA, 40/44px touch targets, rAF-throttle + touch-skip on pointer effects, off-screen + reduced-motion animation pause, one-shot timeline observer (no blur/scroll thrash).
- **Content:** plain-language home/featured/terminal, business-outcome case metrics, risk-reversal guarantee + FAQ, NDA reframed as trust signal, unified case headings (О чём проект / Как устроено), email fallback, HTML-entity email, six-step process (price anchor + mid-CTA were added then removed by client).

## Контактная форма заявок → Telegram (серверная, добавлена 2026-06-03)

Форма на **services.html** (`.cform` — карточка с шапкой-статусом; бюджет выбирается чипами `.bchip`; `$`-лейблы) отправляет заявку через Cloudflare Worker владельцу в Telegram. **На index.html формы НЕТ** (была — убрана по решению владельца, контакт там = кнопки Telegram/email/аудит).

- **Worker:** `src/index.js` — `main` в `wrangler.jsonc` + `assets.binding: "ASSETS"` (раньше сайт был чистой статикой). `POST /api/contact`: валидация, honeypot-поле `company` (скрыто `.cf2-hp`, отсекает ботов), пересылка в Telegram Bot API `sendMessage`; всё прочее → `env.ASSETS.fetch`. `src/` спрятан в `.assetsignore` (не раздаётся).
- **Секреты** (Cloudflare → Workers & Pages → site → Settings → Variables and Secrets, тип **Secret**/encrypted, НИКОГДА не в репо): `TELEGRAM_BOT_TOKEN` (от @BotFather), `TELEGRAM_CHAT_ID` (личный Telegram-id ВЛАДЕЛЬЦА от @userinfobot — id получателя, НЕ бота).
- **Фронт:** `initContactForm` в `chrome.js` — `fetch` на `/api/contact`; чипы бюджета пишут в hidden `input[name=budget]`; при `503 not_configured` / сетевой ошибке мягкий откат на `mailto`. Без JS — прямые контакты в форме (`.cf2-alt`).
- **⚠️ GOTCHA (стоило часа возни):** git-push (`npx wrangler deploy` через Workers Builds) иногда **сбрасывает `TELEGRAM_CHAT_ID`** (token при этом переживает). Признак: форма «переводит на почту», `/api/contact` → `503 not_configured`. Фикс: в dashboard Edit `TELEGRAM_CHAT_ID` → ввести число → Deploy, **ПОСЛЕ последнего деплоя кода**. Проверка БЕЗ спама в ТГ невозможна — POST реально шлёт; быстрый тест: `curl -X POST https://vire.dev/api/contact -H 'content-type: application/json' -d '{"task":"t","contact":"c"}'` → `{"ok":true}` = работает, `not_configured` = chat_id слетел. Диагностику наличия секретов делали временным `/api/debug` (возвращал hasToken/hasChat/длины — удалён, в проде быть НЕ должен).
- Бесплатно: Workers free ~100k req/день; раздача статики не считается.

## Сессия 2026-06-03 — что сделано (резюме, чтобы не разбираться заново)
1. **4 функциональных добавления (вариант A, одобрены владельцем):**
   - Форма захвата на services (см. выше).
   - `.biz-translate` — строка «Что это даёт бизнесу: …» после технического блока в `case/container-bot.html` (§03 биллинг) и `case/pekarna-bot.html` (§03 B2B). Перевод техники на язык денег; код-карточки остаются (терминальная эстетика — это фишка).
   - `.nf-suggest` — блок «Возможно, вы искали» с 3 кейсами на `404.html` (чтобы холодный лид не упирался в тупик).
   - SEO: `og:title`/`twitter:title` подтянуты к сильному `<title>` на index; якорь `id="01"` на тариф консультации в services.
2. **Серверная форма → Telegram** (раздел выше).
3. **Свой домен `vire.dev`** — куплен, подключён, прошит везде.
- **ОТВЕРГНУТО владельцем в этой сессии (НЕ предлагать снова):**
  - **Полоска доверия под hero** (`.trust-strip`, «6 систем · продан в банке · 8.5/10 · код открыт») — убрана: дублировала факты, которые и так ниже на главной (featured-метрики, «Кто я»); дробила чистый первый экран.
  - **«Креативные» версии формы** (терминал-композер с `$ describe`, мигающий курсор) и **«luxe-полировка»** (grain/noise overlay, двойные hairlines, tabular-nums, count-up статус-бар) — реакция владельца «банально/дёшево». Вывод: **сайт уже на визуальном потолке; визуальная полировка ради «дороговизны» ему противопоказана, ценность только в смысловых добавлениях, не в декоре.** (см. память `feedback-design-preferences`).
  - **Дубль кнопки «Запросить аудит»** — убран: осталась 1× в `#contact`; в hero вторичная кнопка → «Смотреть работы» (`#featured`).
  - **Готовый текст-заготовка** в поле формы — отвергнут, вернули placeholder.

## Следующие шаги — приоритет ТРАФИК, не фичи (владелец сам назвал: «меня никто не знает»)
Сайт-инструмент готов (≈10/10). Узкое место — **нулевая известность**, а не функционал. Дальше работаем НЕ над сайтом, а над привлечением людей:
1. **Custom domain `vire.dev` — DONE.** Осталось владельцу: отключить тумблеры старого `*.workers.dev`.
2. **Первые клиенты** — главный разговор. Откуда придут первые 3-5 заявок для backend-инженера в Ташкенте: тёплый круг (знакомые бизнесы, которым нужна автоматизация), профильные Telegram-чаты IT/предпринимателей Узбекистана, фриланс-площадки, прямой аутрич. Поиск/SEO раскачивается месяцами — на старте трафик идёт ОТ владельца (ссылка в подписи/чатах/визитке), поэтому `.dev` ок (не нужен «случайно вбить .com»).
3. **Опционально, когда пойдёт трафик:** privacy-friendly аналитика (Cloudflare Web Analytics — без кук; лозунг «no cookies» в футере остаётся честным) — чтобы видеть воронку. **Автоответ в форме НЕ нужен** при нуле/малом потоке — личный ответ за минуты конвертирует лучше робота (решение владельца).
