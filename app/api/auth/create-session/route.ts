import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";

/**
 * API endpoint для создания сессии
 * POST /api/auth/create-session
 */
export async function POST(request: NextRequest) {
  console.log("[API CREATE-SESSION] Получен запрос на создание сессии");

  try {
    const body = await request.json();
    const { username, step } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username обязателен" },
        { status: 400 }
      );
    }

    // Создаем сессию
    await setSession({
      step: step || "code",
      username: username,
    });

    console.log("[API CREATE-SESSION] Сессия создана:", { username, step });

    return NextResponse.json({
      success: true,
      message: "Сессия создана",
    });
  } catch (error) {
    console.error("[API CREATE-SESSION] Ошибка:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ошибка при создании сессии",
      },
      { status: 500 }
    );
  }
}













