import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware для защиты маршрутов
 * Проверяет сессию и перенаправляет пользователей
 * Добавлена Basic Auth защита для тестовой среды
 */
export function middleware(request: NextRequest) {
  // Basic Auth защита (только если включена через переменную окружения)
  const enableBasicAuth = process.env.ENABLE_BASIC_AUTH === "true";
  if (enableBasicAuth) {
    const authHeader = request.headers.get("authorization");
    
    // Настройки Basic Auth (из переменных окружения или дефолтные)
    const authUser = process.env.BASIC_AUTH_USER || "tester";
    const authPass = process.env.BASIC_AUTH_PASS || "test123";
    
    // Проверяем Basic Auth
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Staging area"',
        },
      });
    }
    
    // Декодируем и проверяем credentials
    const base64Credentials = authHeader.replace("Basic ", "");
    try {
      // В Edge Runtime используем встроенную функцию декодирования
      const decodedCredentials = atob(base64Credentials);
      const [user, pass] = decodedCredentials.split(":");
      
      if (user !== authUser || pass !== authPass) {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Staging area"',
          },
        });
      }
    } catch (error) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Staging area"',
        },
      });
    }
  }

  const sessionCookie = request.cookies.get("session");

  // Страница verify-code теперь показывает форму входа, защита не нужна

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};


