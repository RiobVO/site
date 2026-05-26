// @ts-check
/**
 * Site-wide chrome: theme switching (dark ⇄ light), language switching.
 * Written in JS with JSDoc types so it ports 1:1 to .ts when the
 * site migrates to Astro.
 */

/** @typedef {'dark' | 'light'} Theme */
/** @typedef {'ru' | 'en'} Lang */

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
}

function bindChrome() {
  const themeBtn = document.querySelector('[data-theme-btn]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = /** @type {Theme} */ (document.body.getAttribute('data-theme') || 'dark');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Lang cycle button (cycles ru → en → uz → ru)
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
  document.querySelectorAll('.work-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });
  });
}

function initHeroTerminal() {
  const termBody = document.getElementById('hero-term');
  const termCard = document.getElementById('hero-term-card');
  if (!termBody) return;

  const lines = /** @type {HTMLElement[]} */ (Array.from(termBody.querySelectorAll('.term-line')));
  if (!lines.length) return;

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

  if (termCard) {
    const wrap = termCard.parentElement;
    if (wrap) {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        termCard.style.transform =
          `rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
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

function initMobileNav() {
  const nav = document.querySelector('.nav-pill');
  if (!nav) return;
  const links = nav.querySelector('.links');
  if (!links) return;

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label', 'Menu');
  burger.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';

  const tools = nav.querySelector('.tools');
  if (tools) tools.before(burger);

  const menu = document.createElement('div');
  menu.className = 'nav-mobile-menu';
  Array.from(links.querySelectorAll('a')).forEach((a) => {
    const clone = a.cloneNode(true);
    menu.appendChild(clone);
  });
  document.body.appendChild(menu);

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(/** @type {Node} */(e.target)) && e.target !== burger) {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

function initAll() {
  bindChrome();
  initMobileNav();
  initScrollReveal();
  initFaqAnimation();
  initCardHover();
  initHeroTerminal();
  initCaseTyping();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
