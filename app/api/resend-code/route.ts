import { NextRequest, NextResponse } from "next/server";
import { sendCodeEmail } from "@/lib/email";
import { getSession } from "@/lib/session";

/**
 * API endpoint для повторной отправки кода подтверждения
 * POST /api/resend-code
 */
export async function POST(request: NextRequest) {
  console.log("[API RESEND-CODE] Получен запрос на повторную отправку кода");

  try {
    // Проверка сессии
    const session = await getSession();

    if (!session || session.step !== "code") {
      console.error("[API RESEND-CODE] Неверная сессия");
      return NextResponse.json(
        { error: "Сессия недействительна. Пожалуйста, войдите снова." },
        { status: 401 }
      );
    }

    // Генерация нового 6-значного кода
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("[API RESEND-CODE] Сгенерирован новый код:", newCode);

    // Отправка Email с новым кодом
    try {
      await sendCodeEmail(newCode, session.username);
      console.log("[API RESEND-CODE] Email с новым кодом отправлен");
    } catch (emailError) {
      console.error("[API RESEND-CODE] Ошибка отправки Email:", emailError);
      return NextResponse.json(
        { error: "Не удалось отправить Email" },
        { status: 500 }
      );
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





