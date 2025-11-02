import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware для защиты маршрутов
 * Проверяет сессию и перенаправляет пользователей
 */
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  // Защита страницы verify-code
  if (request.nextUrl.pathname.startsWith("/verify-code")) {
    if (!sessionCookie) {
      console.log("[MIDDLEWARE] Нет сессии, редирект на вход");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.step !== "code") {
        console.log("[MIDDLEWARE] Неверная сессия, редирект на вход");
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Ошибка чтения сессии:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Защита страницы 404 (только после подтверждения кода)
  if (request.nextUrl.pathname === "/404") {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.step !== "completed") {
        console.log("[MIDDLEWARE] Код не подтвержден, редирект на вход");
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Ошибка чтения сессии:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/verify-code", "/404"],
};


