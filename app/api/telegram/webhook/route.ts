import { NextRequest, NextResponse } from "next/server";
import {
  updateLoginRequestStatus,
  getLoginRequest,
  deleteLoginRequest,
} from "@/lib/login-requests";
import { answerCallbackQuery } from "@/lib/telegram";

/**
 * Webhook endpoint для получения обновлений от Telegram Bot
 * POST /api/telegram/webhook
 */
export async function POST(request: NextRequest) {
  console.log("[TELEGRAM WEBHOOK] Получено обновление");

  try {
    const body = await request.json();
    console.log("[TELEGRAM WEBHOOK] Тело запроса:", JSON.stringify(body, null, 2));

    // Обработка callback query (нажатие на кнопки)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const callbackQueryId = callbackQuery.id;

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

    // Обработка обычных сообщений (если нужно)
    if (body.message) {
      console.log("[TELEGRAM WEBHOOK] Получено сообщение:", body.message.text);
      // Здесь можно добавить обработку текстовых команд
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

