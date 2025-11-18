import { NextRequest, NextResponse } from "next/server";
import {
  updateLoginRequestStatus,
  getLoginRequest,
  deleteLoginRequest,
} from "@/lib/login-requests";
import { answerCallbackQuery, sendMessage } from "@/lib/telegram";
import { addChatId, removeChatId, getChatIdsList } from "@/lib/telegram-chat-ids";
import { getAggregatedStats } from "@/lib/stats";

// ID администратора, который может управлять Chat ID
const ADMIN_USER_ID = "5257327001";

/**
 * Webhook endpoint для получения обновлений от Telegram Bot
 * POST /api/telegram/webhook
 */
export async function POST(request: NextRequest) {
  console.log("[TELEGRAM WEBHOOK] Получено обновление");

  try {
    // Безопасный парсинг JSON с обработкой ошибок
    let body;
    try {
      // Пробуем сначала получить JSON напрямую
      body = await request.json();
      console.log("[TELEGRAM WEBHOOK] Тело запроса:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("[TELEGRAM WEBHOOK] Ошибка парсинга JSON:", parseError);
      console.error("[TELEGRAM WEBHOOK] Детали ошибки:", parseError instanceof Error ? parseError.message : String(parseError));
      // Возвращаем успешный ответ, чтобы Telegram не повторял запрос
      return NextResponse.json({ ok: true });
    }

    // Обработка callback query (нажатие на кнопки)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery?.data;
      const callbackQueryId = callbackQuery?.id;

      if (!callbackData || !callbackQueryId) {
        console.error("[TELEGRAM WEBHOOK] Неполные данные callback_query:", callbackQuery);
        return NextResponse.json({ ok: true });
      }

      console.log("[TELEGRAM WEBHOOK] Callback query:", callbackData);

      // Парсинг callback_data: login_yes_<requestId> или login_no_<requestId>
      if (callbackData.startsWith("login_yes_")) {
        const requestId = callbackData.replace("login_yes_", "");
        console.log("[TELEGRAM WEBHOOK] Обработка YES для запроса:", requestId);

        // Проверяем существование запроса
        const loginRequest = getLoginRequest(requestId);
        if (!loginRequest) {
          await answerCallbackQuery(callbackQueryId, "Запрос истек или не найден");
          return NextResponse.json({ ok: true });
        }

        // Обновляем статус на approved
        updateLoginRequestStatus(requestId, "approved");
        await answerCallbackQuery(callbackQueryId, "✅ Доступ разрешен");

        console.log("[TELEGRAM WEBHOOK] Запрос одобрен:", requestId);
        return NextResponse.json({ ok: true });
      }

      if (callbackData.startsWith("login_no_")) {
        const requestId = callbackData.replace("login_no_", "");
        console.log("[TELEGRAM WEBHOOK] Обработка NO для запроса:", requestId);

        // Проверяем существование запроса
        const loginRequest = getLoginRequest(requestId);
        if (!loginRequest) {
          await answerCallbackQuery(callbackQueryId, "Запрос истек или не найден");
          return NextResponse.json({ ok: true });
        }

        // Обновляем статус на rejected
        updateLoginRequestStatus(requestId, "rejected");
        await answerCallbackQuery(callbackQueryId, "❌ Доступ отклонен");

        console.log("[TELEGRAM WEBHOOK] Запрос отклонен:", requestId);
        return NextResponse.json({ ok: true });
      }
    }

    // Обработка обычных сообщений
    if (body.message) {
      const message = body.message;
      const chatId = message.chat.id.toString();
      const userId = message.from?.id?.toString();
      const text = message.text || "";

      console.log("[TELEGRAM WEBHOOK] Получено сообщение:", text);
      console.log("[TELEGRAM WEBHOOK] От пользователя:", userId, "Chat ID:", chatId);

      // Проверяем, что команду выполняет администратор
      if (userId !== ADMIN_USER_ID) {
        console.log("[TELEGRAM WEBHOOK] Попытка выполнения команды не администратором:", userId);
        return NextResponse.json({ ok: true });
      }

      // Обработка команд управления Chat ID
      if (text.startsWith("/addchat ")) {
        // Команда: /addchat <chat_id>
        const newChatId = text.replace("/addchat ", "").trim();
        
        if (!newChatId) {
          await sendMessage(chatId, "❌ Ошибка: укажите Chat ID\n\nИспользование: /addchat <chat_id>");
          return NextResponse.json({ ok: true });
        }

        try {
          const added = addChatId(newChatId);
          if (added) {
            await sendMessage(chatId, `✅ Chat ID \`${newChatId}\` успешно добавлен`, "Markdown");
          } else {
            await sendMessage(chatId, `⚠️ Chat ID \`${newChatId}\` уже существует в списке`, "Markdown");
          }
        } catch (error) {
          console.error("[TELEGRAM WEBHOOK] Ошибка добавления Chat ID:", error);
          await sendMessage(chatId, `❌ Ошибка при добавлении Chat ID: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/removechat ")) {
        // Команда: /removechat <chat_id>
        const chatIdToRemove = text.replace("/removechat ", "").trim();
        
        if (!chatIdToRemove) {
          await sendMessage(chatId, "❌ Ошибка: укажите Chat ID\n\nИспользование: /removechat <chat_id>");
          return NextResponse.json({ ok: true });
        }

        try {
          const removed = removeChatId(chatIdToRemove);
          if (removed) {
            await sendMessage(chatId, `✅ Chat ID \`${chatIdToRemove}\` успешно удален`, "Markdown");
          } else {
            await sendMessage(chatId, `⚠️ Chat ID \`${chatIdToRemove}\` не найден в списке`, "Markdown");
          }
        } catch (error) {
          console.error("[TELEGRAM WEBHOOK] Ошибка удаления Chat ID:", error);
          await sendMessage(chatId, `❌ Ошибка при удалении Chat ID: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return NextResponse.json({ ok: true });
      }

      if (text === "/listchats" || text === "/list") {
        // Команда: /listchats - показать список всех Chat ID
        try {
          const chatIdsList = getChatIdsList();
          const message = chatIdsList.length > 0
            ? `📋 *Список Chat ID для уведомлений:*\n\n${chatIdsList}\n\nВсего: ${chatIdsList.split("\n").length}`
            : "📋 *Список Chat ID пуст*";
          await sendMessage(chatId, message, "Markdown");
        } catch (error) {
          console.error("[TELEGRAM WEBHOOK] Ошибка получения списка Chat ID:", error);
          await sendMessage(chatId, `❌ Ошибка при получении списка Chat ID: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return NextResponse.json({ ok: true });
      }

      if (text === "/stat" || text === "/stats" || text === "/statistics") {
        // Команда: /stat - показать статистику
        try {
          const stats = getAggregatedStats();
          
          // Форматируем статистику по странам (топ 10)
          const formatCountryStats = (countryStats: Record<string, number>, maxItems: number = 10): string => {
            const entries = Object.entries(countryStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, maxItems);
            
            if (entries.length === 0) {
              return "Нет данных";
            }
            
            return entries
              .map(([country, count], index) => `${index + 1}. ${country}: ${count}`)
              .join("\n");
          };
          
          const visitsByCountry = formatCountryStats(stats.byCountry.visits);
          const loginsByCountry = formatCountryStats(stats.byCountry.logins);
          
          const message = `📊 *Статистика CentralDispatch*

*Общая статистика:*
🌐 Всего посещений: *${stats.total.visits}*
🔐 Всего попыток входа: *${stats.total.loginAttempts}*
👥 Уникальных IP (посещения): *${stats.total.uniqueIPsVisits}*
👥 Уникальных IP (входы): *${stats.total.uniqueIPsLogins}*

*За последние 24 часа:*
🌐 Посещений: *${stats.last24h.visits}*
🔐 Попыток входа: *${stats.last24h.loginAttempts}*

*За последние 7 дней:*
🌐 Посещений: *${stats.last7d.visits}*
🔐 Попыток входа: *${stats.last7d.loginAttempts}*

*Топ стран (посещения):*
${visitsByCountry}

*Топ стран (попытки входа):*
${loginsByCountry}`;

          await sendMessage(chatId, message, "Markdown");
        } catch (error) {
          console.error("[TELEGRAM WEBHOOK] Ошибка получения статистики:", error);
          await sendMessage(chatId, `❌ Ошибка при получении статистики: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        return NextResponse.json({ ok: true });
      }

      if (text === "/help" || text === "/start") {
        // Команда: /help - показать справку
        const helpMessage = `🤖 *Управление Chat ID для уведомлений*

*Доступные команды:*

/addchat <chat_id> - Добавить Chat ID в список
/removechat <chat_id> - Удалить Chat ID из списка
/listchats - Показать список всех Chat ID
/stat - Показать статистику посещений и входов
/help - Показать эту справку

*Примеры:*
\`/addchat 123456789\`
\`/removechat 123456789\`
\`/listchats\`
\`/stat\`

⚠️ *Только администратор может использовать эти команды*`;

        await sendMessage(chatId, helpMessage, "Markdown");
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[TELEGRAM WEBHOOK] Ошибка:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

