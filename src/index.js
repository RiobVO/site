/**
 * Cloudflare Worker для сайта.
 *
 * Назначение: принять заявку с формы контакта (/api/contact) и переслать её
 * мне в Telegram. Вся статика (HTML/CSS/JS/шрифты) по-прежнему раздаётся
 * биндингом ASSETS — Worker вмешивается только в API-маршрут.
 *
 * Секреты задаются в окружении Cloudflare (Settings → Variables and Secrets),
 * в коде/репозитории их нет:
 *   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID   — id чата, куда слать заявки (мой личный chat с ботом)
 */

const LIMITS = { task: 4000, contact: 200, budget: 40 };

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (req: Request) => Promise<Response> }, TELEGRAM_BOT_TOKEN?: string, TELEGRAM_CHAT_ID?: string }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/debug') {
      return json({
        hasToken: !!env.TELEGRAM_BOT_TOKEN,
        tokenLen: env.TELEGRAM_BOT_TOKEN ? env.TELEGRAM_BOT_TOKEN.length : 0,
        hasChat: !!env.TELEGRAM_CHAT_ID,
        chatLen: env.TELEGRAM_CHAT_ID ? env.TELEGRAM_CHAT_ID.length : 0,
      });
    }

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'method_not_allowed' }, 405);
      }
      return handleContact(request, env);
    }

    // всё остальное — статические ассеты
    return env.ASSETS.fetch(request);
  },
};

/**
 * @param {Request} request
 * @param {{ TELEGRAM_BOT_TOKEN?: string, TELEGRAM_CHAT_ID?: string }} env
 */
async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  // honeypot: скрытое поле, видимое только ботам. Заполнено → тихо «успех», ничего не шлём.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return json({ ok: true });
  }

  const task = clean(body.task, LIMITS.task);
  const contact = clean(body.contact, LIMITS.contact);
  const budget = clean(body.budget, LIMITS.budget);

  if (!task || !contact) {
    return json({ ok: false, error: 'missing_fields' }, 422);
  }

  // Секреты не заданы → сигналим фронту, чтобы откатился на mailto.
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: 'not_configured' }, 503);
  }

  const text =
    '🔔 Новая заявка с сайта\n\n' +
    '📋 Задача:\n' + task + '\n\n' +
    '📨 Контакт: ' + contact +
    (budget ? '\n💰 Бюджет: ' + budget : '');

  let tgResp;
  try {
    tgResp = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    });
  } catch {
    return json({ ok: false, error: 'telegram_unreachable' }, 502);
  }

  if (!tgResp.ok) {
    // не раскрываем детали наружу, но логируем для observability
    console.error('Telegram sendMessage failed', tgResp.status, await safeText(tgResp));
    return json({ ok: false, error: 'telegram_error' }, 502);
  }

  return json({ ok: true });
}

/** Обрезает и приводит к строке; защита от мусора/гигантских payload'ов. */
function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

async function safeText(resp) {
  try { return await resp.text(); } catch { return '<no body>'; }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
