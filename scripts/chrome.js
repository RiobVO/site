// @ts-check
/**
 * Site-wide chrome: theme switching (dark ⇄ light), language switching.
 * Written in JS with JSDoc types so it ports 1:1 to .ts when the
 * site migrates to Astro.
 */

/** @typedef {'dark' | 'light'} Theme */
/** @typedef {'ru' | 'en'} Lang */

// Прогрессивное улучшение: помечаем, что JS активен. CSS прячет .reveal/.term-line
// (и переключает язык) только при наличии .js — если скрипт не загрузился или
// отключён, контент остаётся видимым, а не пустым.
document.documentElement.classList.add('js');

const STORAGE_THEME = 'elyor.theme';
const STORAGE_LANG = 'elyor.lang';

/** @returns {Theme} */
function readTheme() {
  const stored = localStorage.getItem(STORAGE_THEME);
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/** @returns {Lang} */
function readLang() {
  const stored = localStorage.getItem(STORAGE_LANG);
  if (stored === 'ru' || stored === 'en') return stored;
  const nav = (navigator.language || 'ru').toLowerCase();
  if (nav.startsWith('en')) return 'en';
  return 'ru';
}

/** @param {Theme} t */
function applyTheme(t) {
  document.body.setAttribute('data-theme', t);
  localStorage.setItem(STORAGE_THEME, t);
  document.documentElement.style.colorScheme = t;

  const btn = document.querySelector('[data-theme-btn]');
  if (btn) {
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light' : 'Switch to dark');
    btn.innerHTML = t === 'dark'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
}

/** @param {Lang} lang */
function applyLang(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('data-active-lang', lang);
  localStorage.setItem(STORAGE_LANG, lang);

  /** @type {NodeListOf<HTMLElement>} */
  const blocks = document.querySelectorAll('[data-lang]');
  blocks.forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });

  document.querySelectorAll('[data-lang-btn]').forEach((b) => {
    b.classList.toggle('current', b.getAttribute('data-lang-btn') === lang);
  });

  // Update the visible lang label in the nav, if present
  const label = document.querySelector('[data-lang-label]');
  if (label) label.textContent = lang.toUpperCase();

  // Сообщаем скринридеру, на какой язык переключит кнопка (контент меняется целиком).
  const cycle = document.querySelector('[data-lang-cycle]');
  if (cycle) cycle.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
}

function bindChrome() {
  const themeBtn = document.querySelector('[data-theme-btn]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = /** @type {Theme} */ (document.body.getAttribute('data-theme') || 'dark');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Lang cycle button (toggles ru ↔ en — no UZ)
  const langBtn = document.querySelector('[data-lang-cycle]');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const current = /** @type {Lang} */ (
        document.body.getAttribute('data-active-lang') || 'ru'
      );
      const next = /** @type {Lang} */ (
        current === 'ru' ? 'en' : 'ru'
      );
      applyLang(next);
    });
  }

  // Per-lang buttons (if explicit picker is shown)
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = /** @type {Lang} */ (btn.getAttribute('data-lang-btn') || 'ru');
      applyLang(lang);
    });
  });

  // Print
  const printBtn = document.querySelector('[data-print-btn]');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

applyTheme(readTheme());
applyLang(readLang());

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Нет IntersectionObserver (старый браузер) → показываем всё сразу, без анимации.
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => observer.observe(el));
}

function initFaqAnimation() {
  document.querySelectorAll('.faq details').forEach((detail) => {
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('.a');
    if (!summary || !content) return;

    content.style.display = 'grid';
    content.style.gridTemplateRows = detail.open ? '1fr' : '0fr';
    content.style.opacity = detail.open ? '1' : '0';
    content.style.transition = 'grid-template-rows 0.3s ease, opacity 0.25s ease';
    content.style.overflow = 'hidden';

    const inner = content.children[0];
    if (inner) inner.style.minHeight = '0';

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (detail.open) {
        content.style.gridTemplateRows = '0fr';
        content.style.opacity = '0';
        setTimeout(() => { detail.open = false; }, 300);
      } else {
        detail.open = true;
        requestAnimationFrame(() => {
          content.style.gridTemplateRows = '1fr';
          content.style.opacity = '1';
        });
      }
    });
  });
}

function initCardHover() {
  // Тач-устройства не имеют hover — не вешаем mousemove (экономим repaint/батарею).
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.work-card').forEach((card) => {
    let raf = 0, mx = 0, my = 0;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width) * 100;
      my = ((e.clientY - rect.top) / rect.height) * 100;
      if (raf) return; // rAF-троттл: не больше одной записи стиля на кадр
      raf = requestAnimationFrame(() => {
        raf = 0;
        card.style.setProperty('--glow-x', mx + '%');
        card.style.setProperty('--glow-y', my + '%');
      });
    });
  });
}

function initHeroTerminal() {
  const termBody = document.getElementById('hero-term');
  const termCard = document.getElementById('hero-term-card');
  if (!termBody) return;

  const lines = /** @type {HTMLElement[]} */ (Array.from(termBody.querySelectorAll('.term-line')));
  if (!lines.length) return;

  // Нет IntersectionObserver → показываем все строки статикой, без набора текста.
  if (!('IntersectionObserver' in window)) {
    lines.forEach((l) => l.classList.add('t-visible'));
    return;
  }

  /**
   * @param {HTMLElement} el
   * @param {number} speed
   * @returns {Promise<void>}
   */
  function typeWriter(el, speed) {
    return new Promise((resolve) => {
      const html = el.innerHTML;
      el.innerHTML = '';
      el.classList.add('t-typing');

      const cursor = document.createElement('span');
      cursor.className = 't-typed-cursor';
      el.appendChild(cursor);

      const tmp = document.createElement('span');
      tmp.innerHTML = html;
      const fullText = tmp.textContent || '';

      const tags = [];
      const re = /<[^>]+>/g;
      let m;
      while ((m = re.exec(html)) !== null) {
        tags.push({ index: m.index, tag: m[0], len: m[0].length });
      }

      let charIndex = 0;
      let htmlIndex = 0;
      let buffer = '';

      function tick() {
        if (charIndex >= fullText.length) {
          el.innerHTML = html;
          el.classList.remove('t-typing');
          el.classList.add('t-visible');
          resolve();
          return;
        }

        while (tags.length && htmlIndex === tags[0].index) {
          buffer += tags[0].tag;
          htmlIndex += tags[0].len;
          tags.shift();
        }

        buffer += html.charAt(htmlIndex);
        htmlIndex++;
        charIndex++;

        el.innerHTML = buffer;
        el.appendChild(cursor);

        setTimeout(tick, speed + Math.random() * speed * 0.6);
      }
      tick();
    });
  }

  async function runSequence() {
    for (const line of lines) {
      const delay = parseInt(line.dataset.delay) || 0;
      const prevDelay = lines.indexOf(line) > 0
        ? parseInt(lines[lines.indexOf(line) - 1].dataset.delay) || 0
        : 0;
      const wait = lines.indexOf(line) === 0 ? delay : Math.max(delay - prevDelay - 200, 100);

      await new Promise(r => setTimeout(r, wait));

      if (line.classList.contains('t-output')) {
        line.classList.add('t-visible');
      } else {
        await typeWriter(line, 22);
      }
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runSequence();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(termBody);

  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (termCard && !coarse) {
    const wrap = termCard.parentElement;
    if (wrap) {
      let traf = 0, tx = 0, ty = 0;
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        tx = (e.clientX - rect.left) / rect.width - 0.5;
        ty = (e.clientY - rect.top) / rect.height - 0.5;
        if (traf) return; // rAF-троттл tilt
        traf = requestAnimationFrame(() => {
          traf = 0;
          termCard.style.transform = `rotateY(${tx * 6}deg) rotateX(${-ty * 4}deg)`;
        });
      });
      wrap.addEventListener('mouseleave', () => {
        termCard.style.transform = 'rotateY(0) rotateX(0)';
      });
    }
  }
}

function initCaseTyping() {
  const el = document.getElementById('caseTyping');
  if (!el) return;

  const fullText = el.textContent;
  el.textContent = '';
  el.style.visibility = 'hidden';

  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';
  el.after(cursor);

  let fired = false;
  const card = el.closest('.code-card');
  if (!card) return;

  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      el.style.visibility = 'visible';
      let i = 0;
      function tick() {
        if (i <= fullText.length) {
          el.textContent = fullText.slice(0, i);
          i++;
          setTimeout(tick, 18 + Math.random() * 12);
        }
      }
      setTimeout(tick, 600);
    }
  }, { threshold: 0.3 }).observe(card);
}

/**
 * One-shot "decision pipeline" run animation on the home page. Stages, links
 * and footer fade / draw in sequence the first time the pipeline scrolls into
 * view. Illustrative single pass — NOT a live feed (the product is on-premise
 * under NDA and streams nothing).
 */
function initPipelineRun() {
  const pipeline = document.querySelector('.pipeline');
  if (!pipeline) return;

  // Respect reduced-motion: leave the block fully visible, skip the animation.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const STEP = 0.16; // seconds between consecutive items
  const items = /** @type {HTMLElement[]} */ (
    Array.from(pipeline.querySelectorAll('.pipe-stage, .pipe-link, .pipe-footer'))
  );
  if (!items.length) return;

  // Arm the hidden state now that JS + motion are confirmed, and stagger each
  // item's delay by DOM order so the cascade flows top-to-bottom.
  pipeline.classList.add('anim');
  items.forEach((el, i) => {
    const delay = (i * STEP) + 's';
    el.style.transitionDelay = delay;
    const vline = /** @type {HTMLElement | null} */ (el.querySelector('.vline'));
    if (vline) vline.style.transitionDelay = delay;
    const score = /** @type {HTMLElement | null} */ (el.querySelector('.ico.score'));
    if (score) score.style.animationDelay = delay;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        pipeline.classList.add('run');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(pipeline);
}

/**
 * One-shot run animation for the services process timeline: the spine draws in
 * and the steps fade up in sequence the first time it scrolls into view. Same
 * progressive-enhancement contract as initPipelineRun (no JS / reduced-motion →
 * full static view).
 */
function initWorkflowRun() {
  const workflow = document.querySelector('.workflow');
  if (!workflow) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const steps = /** @type {HTMLElement[]} */ (Array.from(workflow.querySelectorAll('.step')));
  if (!steps.length) return;

  workflow.classList.add('anim');
  steps.forEach((el, i) => {
    el.style.transitionDelay = (0.2 + i * 0.12) + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        workflow.classList.add('run');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(workflow);
}

/**
 * FAQ cards stagger up the first time the list scrolls into view — same run
 * feel as the timeline. Same progressive-enhancement contract; open/close
 * interaction is untouched (handled by initFaqAnimation).
 */
function initFaqReveal() {
  const faq = document.querySelector('.faq');
  if (!faq) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const items = /** @type {HTMLElement[]} */ (Array.from(faq.querySelectorAll('details')));
  if (!items.length) return;

  faq.classList.add('anim');
  items.forEach((el, i) => {
    el.style.transitionDelay = (i * 0.07) + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        faq.classList.add('run');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(faq);
}

function initMobileNav() {
  const nav = document.querySelector('.nav-pill');
  if (!nav) return;
  const links = nav.querySelector('.links');
  if (!links) return;

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label', 'Menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'nav-mobile-menu');
  burger.innerHTML = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';

  const tools = nav.querySelector('.tools');
  if (tools) tools.before(burger);

  const menu = document.createElement('div');
  menu.className = 'nav-mobile-menu';
  menu.id = 'nav-mobile-menu';
  Array.from(links.querySelectorAll('a')).forEach((a) => {
    menu.appendChild(a.cloneNode(true));
  });
  // Клон главного CTA — чтобы на телефоне был прямой контакт прямо из меню (#24).
  const cta = nav.querySelector('.cta');
  if (cta) {
    const ctaClone = /** @type {HTMLElement} */ (cta.cloneNode(true));
    ctaClone.classList.add('mobile-cta');
    menu.appendChild(ctaClone);
  }
  document.body.appendChild(menu);

  function closeMenu() {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  // Тап по пункту/CTA закрывает меню — иначе оно перекрывает контент (#24).
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (!menu.contains(/** @type {Node} */(e.target)) && e.target !== burger) closeMenu();
  });

  // Escape закрывает меню и возвращает фокус на бургер (#56).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      burger.focus();
    }
  });
}

/**
 * Карусель отзывов поверх нативного scroll-snap: листание свайпом/трекпадом
 * работает без JS. JS добавляет точки-индикаторы (по «страницам» — сколько
 * карточек влезает в ряд) и автопрокрутку с паузой на наведение.
 * reduced-motion → без автопрокрутки. Точки синхронизируются со скроллом.
 */
function initTestimonials() {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.t-track');
    const dotsWrap = root.querySelector('.t-dots');
    if (!track || !dotsWrap) return;
    const cards = Array.from(track.children);
    if (cards.length < 2) return;

    const reduce = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Собственный индекс активной «страницы» — единственный источник правды.
    // Автоход НЕ считывает scrollLeft (он промежуточный во время анимации),
    // а ведёт page сам. Направление dir даёт ping-pong вместо рывка-петли.
    let page = 0;
    let dir = 1;
    let dots = [];
    let programmatic = false;   // флаг: скролл инициирован нами, не пользователем
    let settleTimer = 0;

    // Сколько карточек видно одновременно → число «страниц» для точек.
    function pageCount() {
      const per = Math.max(1, Math.round(track.clientWidth / cards[0].offsetWidth));
      return Math.max(1, cards.length - per + 1);
    }

    function buildDots() {
      const n = pageCount();
      if (page > n - 1) page = n - 1;
      dotsWrap.innerHTML = '';
      dots = Array.from({ length: n }, (_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Отзыв ' + (i + 1));
        b.addEventListener('click', () => { goTo(i); restart(); });
        dotsWrap.appendChild(b);
        return b;
      });
      paintDots();
    }

    function paintDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === page));
    }

    function goTo(i) {
      page = Math.max(0, Math.min(i, dots.length - 1));
      programmatic = true;
      track.scrollTo({ left: cards[page].offsetLeft - track.offsetLeft, behavior: 'smooth' });
      paintDots();
      // снимаем флаг, когда плавный скролл заведомо завершился
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { programmatic = false; }, 700);
    }

    // Пользовательский свайп/скролл: подхватываем позицию в page (но не во
    // время нашей же программной анимации, иначе автоход сбивается).
    let raf = 0;
    track.addEventListener('scroll', () => {
      if (programmatic || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = track.scrollLeft;
        let best = 0, bestD = Infinity;
        cards.forEach((c, i) => {
          const d = Math.abs((c.offsetLeft - track.offsetLeft) - x);
          if (d < bestD) { bestD = d; best = i; }
        });
        page = Math.min(best, dots.length - 1);
        dir = page === 0 ? 1 : (page === dots.length - 1 ? -1 : dir);
        paintDots();
      });
    }, { passive: true });

    let timer = 0;
    function tick() {
      if (dots.length < 2) return;
      if (page + dir > dots.length - 1 || page + dir < 0) dir = -dir;  // ping-pong
      goTo(page + dir);
    }
    function start() { if (!reduce) { stop(); timer = setInterval(tick, 5000); } }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(buildDots, 150);
    });

    buildDots();
    start();
  });
}

/**
 * Integrations-viz: на reduced-motion полностью останавливаем SMIL-пакеты,
 * иначе ставим все анимации на паузу, когда блок вне экрана (CPU/батарея). (#41/#67)
 */
function initIntegrationsViz() {
  const viz = document.querySelector('.integrations-viz');
  if (!viz) return;
  const svg = /** @type {any} */ (viz.querySelector('svg.lines'));
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
    return;
  }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      viz.classList.toggle('viz-paused', !e.isIntersecting);
      if (svg) {
        if (e.isIntersecting && svg.unpauseAnimations) svg.unpauseAnimations();
        else if (svg.pauseAnimations) svg.pauseAnimations();
      }
    });
  }, { threshold: 0 });
  io.observe(viz);
}

function initAll() {
  bindChrome();
  initMobileNav();
  initTestimonials();
  initScrollReveal();
  initFaqAnimation();
  initCardHover();
  initHeroTerminal();
  initCaseTyping();
  initPipelineRun();
  initWorkflowRun();
  initFaqReveal();
  initIntegrationsViz();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
