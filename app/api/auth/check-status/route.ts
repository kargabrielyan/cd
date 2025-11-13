import { NextRequest, NextResponse } from "next/server";
import { getLoginRequest, deleteLoginRequest } from "@/lib/login-requests";

/**
 * API endpoint для проверки статуса входа (long polling)
 * GET /api/auth/check-status?requestId=<requestId>
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json(
      { error: "requestId обязателен" },
      { status: 400 }
    );
  }

  console.log("[CHECK-STATUS] Проверка статуса для запроса:", requestId);

  const loginRequest = getLoginRequest(requestId);

  if (!loginRequest) {
    return NextResponse.json(
      { error: "Запрос не найден или истек" },
      { status: 404 }
    );
  }

  // Если статус еще pending, возвращаем pending
  if (loginRequest.status === "pending") {
    return NextResponse.json({
      status: "pending",
      message: "Ожидание ответа...",
    });
  }

  // Если статус approved или rejected, возвращаем результат и удаляем запрос
  const result = {
    status: loginRequest.status,
    message:
      loginRequest.status === "approved"
        ? "Доступ разрешен"
        : "Доступ отклонен",
  };

  // Удаляем запрос после получения результата
  deleteLoginRequest(requestId);

  return NextResponse.json(result);
}

