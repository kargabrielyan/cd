"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Компонент страницы входа с параметрами
 */
function LoginPageContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("ReturnUrl");

  console.log("[LOGIN] Отображение страницы входа, ReturnUrl:", returnUrl);

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

