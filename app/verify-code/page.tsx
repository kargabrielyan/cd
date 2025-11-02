import CodeInput from "@/components/CodeInput/CodeInput";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Страница ввода 6-значного кода
 * Защищена - доступна только после входа
 */
export default async function VerifyCodePage() {
  const session = await getSession();

  // Проверка сессии - должен быть на шаге "code"
  if (!session || session.step !== "code") {
    console.log("[VERIFY-CODE] Доступ запрещен, редирект на вход");
    redirect("/sign-in");
  }

  return <CodeInput />;
}


