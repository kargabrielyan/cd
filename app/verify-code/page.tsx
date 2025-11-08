import SignInForm from "@/components/SignInForm/SignInForm";

/**
 * Страница входа
 * Маршрут /verify-code теперь показывает форму входа с заголовком VERIFY ACCESS
 */
export default function VerifyCodePage() {
  console.log("[VERIFY-CODE] Отображение страницы входа");
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
    />
  );
}


