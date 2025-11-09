"use client";

import { useSearchParams } from "next/navigation";
import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Страница входа
 * Маршрут: /Account/Login?ReturnUrl=...
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("ReturnUrl");

  console.log("[LOGIN] Отображение страницы входа, ReturnUrl:", returnUrl);

  return <SignInForm />;
}

