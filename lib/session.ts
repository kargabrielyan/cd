import { cookies } from "next/headers";
import type { SessionData } from "@/types";

/**
 * Сохранение данных сессии в cookie
 */
export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 час
  });
  console.log("[SESSION] Сессия сохранена:", data);
}

/**
 * Получение данных сессии из cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    console.log("[SESSION] Сессия не найдена");
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as SessionData;
    console.log("[SESSION] Сессия получена:", session);
    return session;
  } catch (error) {
    console.error("[SESSION] Ошибка чтения сессии:", error);
    return null;
  }
}

/**
 * Удаление сессии
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  console.log("[SESSION] Сессия удалена");
}










