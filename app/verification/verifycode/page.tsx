"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Компонент страницы верификации с параметрами
 */
function VerifyCodePageContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const sendCodeSelector = searchParams.get("sendCodeSelector");

  console.log("[VERIFY-CODE] Отображение страницы верификации", {
    userName,
    sendCodeSelector,
  });

  // Создаем сессию с username при загрузке страницы
  useEffect(() => {
    if (userName) {
      const createSession = async () => {
        try {
          await fetch("/api/auth/create-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: userName,
              step: "code",
            }),
          });
          console.log("[VERIFY-CODE] Сессия создана с username:", userName);
        } catch (error) {
          console.error("[VERIFY-CODE] Ошибка создания сессии:", error);
        }
      };
      createSession();
    }
  }, [userName]);

  return (
    <SignInForm
      title="VERIFY ACCESS"
      noticeImage="/verifytext.png"
      showPassword={false}
      showRemember={false}
      usernameLabel="Verification Code"
      usernamePlaceholder="Enter Code"
      showForgot={false}
      showCreateAccount={false}
      alignTop={true}
      buttonText="SUBMIT"
      showBottomButtons={true}
      defaultUsername={userName || undefined}
    />
  );
}

/**
 * Страница верификации кода
 * Маршрут: /verification/verifycode?userName=username&sendCodeSelector=Email
 */
export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCodePageContent />
    </Suspense>
  );
}

