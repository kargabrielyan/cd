"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Компонент страницы входа с параметрами
 */
function LoginPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const returnUrl = searchParams.get("ReturnUrl");

  console.log("[LOGIN] Отображение страницы входа, ReturnUrl:", returnUrl);

  // Отправляем уведомление о посещении при загрузке страницы
  useEffect(() => {
    const sendVisitNotification = async () => {
      try {
        await fetch("/api/visit-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname + (returnUrl ? `?ReturnUrl=${encodeURIComponent(returnUrl)}` : ""),
            userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
          }),
        });
      } catch (error) {
        console.error("[LOGIN] Ошибка отправки уведомления о посещении:", error);
      }
    };

    sendVisitNotification();
  }, [pathname, returnUrl]);

  return <SignInForm />;
}

/**
 * Страница входа
 * Маршрут: /Account/Login?ReturnUrl=...
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

