"use client";

import { useSearchParams } from "next/navigation";
import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Страница верификации кода
 * Маршрут: /verification/verifycode?userName=username&sendCodeSelector=Email
 */
export default function VerifyCodePage() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const sendCodeSelector = searchParams.get("sendCodeSelector");

  console.log("[VERIFY-CODE] Отображение страницы верификации", {
    userName,
    sendCodeSelector,
  });

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

