"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/Logo/Logo";

/**
 * Компонент формы входа
 * Реализует все элементы формы согласно детальному описанию
 */
export default function SignInForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Загрузка сохраненного username при монтировании
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUsername = localStorage.getItem("rememberedUsername");
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberUsername(true);
        console.log("[SIGNIN] Загружен сохраненный username:", savedUsername);
      }
    }
  }, []);

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
    if (!username.trim() || !password.trim()) {
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          rememberUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при входе");
      }

      console.log("[SIGNIN] Вход успешен, перенаправление на страницу кода");
      router.push("/verify-code");
    } catch (err) {
      console.error("[SIGNIN] Ошибка входа:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="page-wrapper flex-1 flex flex-col items-center justify-center">
        <div className="login-card">
          {/* Логотип */}
          <div className="brand">
            <Logo />
          </div>

          {/* Разделительная линия */}
          <div className="divider"></div>

          {/* Заголовок SIGN IN */}
          <h1>SIGN IN</h1>

          {/* Информационный блок Reminder */}
          <div className="notice">
            <Image
              src="/remember-block.png?v=2"
              alt="Remember notice"
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

            {/* Поле Username */}
            <div className="form-row">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Поле Password */}
            <div className="form-row password-wrapper">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <Image
                  src="/eye.png"
                  alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  width={50}
                  height={50}
                  unoptimized
                />
              </button>
            </div>

            {/* Чекбокс Remember my Username */}
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

            {/* Кнопка SIGN IN */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-signin"
            >
              {isLoading ? "Вход..." : "SIGN IN"}
            </button>
          </form>

          {/* Блок Forgot */}
          <div className="forgot-row">
            <div className="forgot-label">Forgot?</div>
            <div className="help-links">
              <a href="#" className="username" aria-label="Recover username">USERNAME</a>
              <a href="#" className="password" aria-label="Recover password">PASSWORD</a>
            </div>
          </div>
        </div>
      </div>

      {/* Секция регистрации - внизу страницы */}
      <div className="create-section" style={{ marginTop: "auto", paddingBottom: "20px" }}>
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
    </div>
  );
}

