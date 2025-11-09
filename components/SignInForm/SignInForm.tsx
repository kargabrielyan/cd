"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/Logo/Logo";

/**
 * Компонент формы входа
 * Реализует все элементы формы согласно детальному описанию
 * @param title - опциональный заголовок (по умолчанию "SIGN IN")
 * @param noticeImage - опциональное изображение для блока notice (по умолчанию "remember-block.png")
 * @param showPassword - показывать ли поле пароля (по умолчанию true)
 * @param showRemember - показывать ли чекбокс "Remember my Username" (по умолчанию true)
 * @param usernameLabel - label для поля username (по умолчанию "Username")
 * @param usernamePlaceholder - placeholder для поля username (по умолчанию пусто)
 * @param showForgot - показывать ли блок "Forgot?" (по умолчанию true)
 * @param showCreateAccount - показывать ли блок "Not A Member? CREATE AN ACCOUNT" (по умолчанию true)
 * @param alignTop - выравнивать ли форму по верху с отступом 65px (по умолчанию false - по центру)
 * @param buttonText - текст кнопки (по умолчанию используется title)
 * @param showBottomButtons - показывать ли кнопки BACK и RESEND CODE внизу (по умолчанию false)
 */
export default function SignInForm({ 
  title = "SIGN IN",
  noticeImage = "/remember-block.png",
  showPassword = true,
  showRemember = true,
  usernameLabel = "Username",
  usernamePlaceholder = "",
  showForgot = true,
  showCreateAccount = true,
  alignTop = false,
  buttonText,
  showBottomButtons = false,
  defaultUsername
}: { 
  title?: string;
  noticeImage?: string;
  showPassword?: boolean;
  showRemember?: boolean;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  showForgot?: boolean;
  showCreateAccount?: boolean;
  alignTop?: boolean;
  buttonText?: string;
  showBottomButtons?: boolean;
  defaultUsername?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(defaultUsername || "");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Проверка валидности кода (6 цифр) для verify-code
  const isCodeValid = usernameLabel === "Verification Code" && /^\d{6}$/.test(username.trim());
  const buttonLabel = buttonText || title;
  // Показывать ошибку после попытки отправки формы для verify-code страницы
  const [showVerificationError, setShowVerificationError] = useState(false);

  // Загрузка сохраненного username при монтировании
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Если передан defaultUsername, используем его
      if (defaultUsername) {
        setUsername(defaultUsername);
        console.log("[SIGNIN] Использован defaultUsername:", defaultUsername);
      } else {
        // Иначе загружаем из localStorage
        const savedUsername = localStorage.getItem("rememberedUsername");
        if (savedUsername) {
          setUsername(savedUsername);
          setRememberUsername(true);
          console.log("[SIGNIN] Загружен сохраненный username:", savedUsername);
        }
      }
    }
  }, [defaultUsername]);

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("[SIGNIN] Попытка входа...");
    console.log("[SIGNIN] Username:", username);
    console.log("[SIGNIN] Remember:", rememberUsername);

    // Валидация
    if (!username.trim()) {
      setError("Пожалуйста, заполните поле");
      setIsLoading(false);
      return;
    }

    // Валидация для verify-code: должен быть 6-значный код
    if (usernameLabel === "Verification Code") {
      if (!/^\d{6}$/.test(username.trim())) {
        setShowVerificationError(true);
        setError("Код должен содержать 6 цифр");
        setIsLoading(false);
        return;
      } else {
        // Если код валидный, скрываем ошибку
        setShowVerificationError(false);
      }
    }

    if (showPassword && !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      setIsLoading(false);
      return;
    }

    // Сохранение username если чекбокс отмечен
    if (rememberUsername) {
      localStorage.setItem("rememberedUsername", username);
      console.log("[SIGNIN] Username сохранен в localStorage");
    } else {
      localStorage.removeItem("rememberedUsername");
      console.log("[SIGNIN] Username удален из localStorage");
    }

    try {
      // Для verify-code отправляем код без пароля
      const requestBody = usernameLabel === "Verification Code"
        ? {
            username: username.trim(),
            password: "", // Пустой пароль для verify-code
            rememberUsername: false,
          }
        : {
            username: username.trim(),
            password: showPassword ? password.trim() : "",
            rememberUsername: showRemember ? rememberUsername : false,
          };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Для verify-code страницы при ошибке показываем изображение ошибки и остаемся на странице
        if (usernameLabel === "Verification Code") {
          setShowVerificationError(true);
          setIsLoading(false);
          // Не показываем текстовое сообщение об ошибке для verify-code
          return;
        }
        throw new Error(data.error || "Ошибка при отправке");
      }

      if (usernameLabel === "Verification Code") {
        console.log("[VERIFY] Код успешно отправлен");
        // После успешной отправки кода перенаправляем на 404
        router.push("/404");
      } else {
        console.log("[SIGNIN] Вход успешен, перенаправление на страницу кода");
        // Перенаправляем на новый URL с параметрами
        const userName = encodeURIComponent(username.trim());
        router.push(`/verification/verifycode?userName=${userName}&sendCodeSelector=Email`);
      }
    } catch (err) {
      console.error("[SIGNIN] Ошибка входа:", err);
      // Для verify-code страницы не показываем текстовое сообщение об ошибке, только изображение
      if (usernameLabel === "Verification Code") {
        setShowVerificationError(true);
        setIsLoading(false);
      } else {
        setError(err instanceof Error ? err.message : "Произошла ошибка");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={alignTop ? "" : "min-h-screen flex flex-col"}>
      <div className={`page-wrapper ${alignTop ? 'page-wrapper-top' : 'flex-1 flex flex-col items-center justify-center'}`}>
        <div className="login-card">
          {/* Логотип */}
          <div className="brand">
            <Logo />
          </div>

          {/* Разделительная линия */}
          <div className="divider"></div>

          {/* Заголовок SIGN IN */}
          <h1>{title}</h1>

          {/* Информационный блок Reminder */}
          <div className="notice">
            {/* Изображение ошибки верификации - показывается после нажатия SUBMIT с неверным кодом */}
            {showVerificationError && usernameLabel === "Verification Code" && (
              <Image
                src="/wrong-verification.png"
                alt="Verification error"
                width={400}
                height={150}
                className="notice-error-image"
                unoptimized
              />
            )}
            <Image
              src={noticeImage}
              alt="Notice"
              width={400}
              height={300}
              className="notice-image"
              unoptimized
            />
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            {/* Сообщение об ошибке */}
            {error && (
              <div className="mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Поле Username / Verification Code */}
            <div className="form-row">
              <label htmlFor="username">{usernameLabel}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={usernamePlaceholder}
                required
              />
            </div>

            {/* Поле Password */}
            {showPassword && (
              <div className="form-row password-wrapper">
                <label htmlFor="password">Password</label>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="password-toggle"
                  aria-label={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                >
                  <Image
                    src="/eye.png"
                    alt={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                    width={50}
                    height={50}
                    unoptimized
                  />
                </button>
              </div>
            )}

            {/* Чекбокс Remember my Username */}
            {showRemember && (
              <div className="remember-row">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                />
                <label htmlFor="remember">Remember my Username</label>
              </div>
            )}

            {/* Кнопка SIGN IN / SUBMIT */}
            <button
              type="submit"
              disabled={isLoading || (usernameLabel === "Verification Code" && !isCodeValid)}
              className="btn-signin"
              style={
                usernameLabel === "Verification Code" && isCodeValid && !isLoading
                  ? { backgroundColor: "#F6BD00" }
                  : {}
              }
            >
              {buttonLabel}
            </button>
          </form>

          {/* Блок Forgot */}
          {showForgot && (
            <div className="forgot-row">
              <div className="forgot-label">Forgot?</div>
              <div className="help-links">
                <a href="#" className="username" aria-label="Recover username">USERNAME</a>
                <a href="#" className="password" aria-label="Recover password">PASSWORD</a>
              </div>
            </div>
          )}

          {/* Кнопки BACK и RESEND CODE */}
          {showBottomButtons && (
            <div className="bottom-buttons-row">
              <button
                type="button"
                className="btn-back"
                onClick={() => {
                  // Кнопка активна, но не выполняет действий
                  console.log("[VERIFY] Кнопка BACK нажата (неактивна)");
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                BACK
              </button>
              <button
                type="button"
                className="btn-resend"
                onClick={() => {
                  console.log("[VERIFY] Кнопка RESEND CODE нажата - перезагрузка страницы");
                  window.location.reload();
                }}
              >
                RESEND CODE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Секция регистрации - внизу страницы */}
      {showCreateAccount && (
        <div className={`create-section ${alignTop ? '' : ''}`} style={alignTop ? { paddingBottom: "20px" } : { marginTop: "auto", paddingBottom: "20px" }}>
          <div className="not-member-text">
            <span>Not A Member?</span>
          </div>
          <button
            type="button"
            className="btn-create"
            onClick={() => alert("Redirect to creation page")}
          >
            CREATE AN ACCOUNT
          </button>
        </div>
      )}
    </div>
  );
}

