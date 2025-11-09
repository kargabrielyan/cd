import { NextResponse } from "next/server";

/**
 * Route handler для favicon.ico
 * Возвращает пустой ответ, чтобы избежать ошибок 500
 */
export async function GET() {
  // Возвращаем 204 No Content - браузер не будет показывать ошибку
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

