import { NextRequest, NextResponse } from "next/server";
import { sendVisitNotification } from "@/lib/telegram";

/**
 * API endpoint для отправки уведомления о посещении сайта
 * POST /api/visit-notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, userAgent, ip } = body;

    // Получаем IP из заголовков, если не передан
    const clientIp = 
      ip || 
      request.headers.get("x-forwarded-for")?.split(",")[0] || 
      request.headers.get("x-real-ip") || 
      "unknown";

    // Получаем User-Agent из заголовков, если не передан
    const clientUserAgent = 
      userAgent || 
      request.headers.get("user-agent") || 
      "unknown";

    // Отправляем уведомление (не ждем ответа, чтобы не блокировать)
    sendVisitNotification(path || request.nextUrl.pathname, clientUserAgent, clientIp).catch(
      (error) => {
        console.error("[VISIT-NOTIFICATION] Ошибка отправки уведомления:", error);
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VISIT-NOTIFICATION] Ошибка:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

