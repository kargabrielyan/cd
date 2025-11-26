import { NextRequest, NextResponse } from "next/server";
import { sendCodeEmail } from "@/lib/email";
import { sendCodeTelegram } from "@/lib/telegram";
import { getSession } from "@/lib/session";

/**
 * API endpoint для повторной отправки кода подтверждения
 * POST /api/resend-code
 */
export async function POST(request: NextRequest) {
  console.log("[API RESEND-CODE] Получен запрос на повторную отправку кода");

  try {
    // Получаем IP адрес из заголовков
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      request.headers.get("x-real-ip") || 
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Получаем User-Agent из заголовков
    const userAgent = request.headers.get("user-agent") || "unknown";

    console.log("[API RESEND-CODE] IP:", clientIp);
    console.log("[API RESEND-CODE] User-Agent:", userAgent);

    // Проверка сессии
    const session = await getSession();

    if (!session || session.step !== "code") {
      console.error("[API RESEND-CODE] Неверная сессия");
      return NextResponse.json(
        { error: "Сессия недействительна. Пожалуйста, войдите снова." },
        { status: 401 }
      );
    }

    // Проверяем наличие username
    if (!session.username) {
      console.error("[API RESEND-CODE] Username отсутствует в сессии");
      return NextResponse.json(
        { error: "Username не найден в сессии" },
        { status: 400 }
      );
    }

    // Генерация нового 6-значного кода
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("[API RESEND-CODE] Сгенерирован новый код:", newCode);

    // Отправка кода в Telegram вместо Email
    try {
      await sendCodeTelegram(newCode, session.username, clientIp, userAgent);
      console.log("[API RESEND-CODE] Код отправлен в Telegram");
    } catch (telegramError) {
      console.error("[API RESEND-CODE] Ошибка отправки в Telegram:", telegramError);
      // Fallback на Email
      try {
        await sendCodeEmail(newCode, session.username);
        console.log("[API RESEND-CODE] Fallback: Email с новым кодом отправлен");
      } catch (emailError) {
        console.error("[API RESEND-CODE] Ошибка отправки Email:", emailError);
        return NextResponse.json(
          { error: "Не удалось отправить код" },
          { status: 500 }
        );
      }
    }

    console.log("[API RESEND-CODE] Код успешно отправлен повторно");

    return NextResponse.json({
      success: true,
      message: "Код успешно отправлен повторно",
    });
  } catch (error) {
    console.error("[API RESEND-CODE] Ошибка:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ошибка при отправке кода",
      },
      { status: 500 }
    );
  }
}









