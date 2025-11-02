import Logo from "@/components/Logo/Logo";
import Link from "next/link";

/**
 * Кастомная страница 404 Error
 * Показывается после подтверждения кода
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm text-center">
        {/* Карточка */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {/* Логотип */}
          <div className="mb-6">
            <Logo />
          </div>

          {/* Разделительная линия */}
          <div className="border-t border-gray-200 mb-6"></div>

          {/* Заголовок 404 */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4 font-condensed">404</h1>
          <h2 className="text-2xl font-bold text-gray-700 mb-4 font-condensed">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Запрашиваемая страница не найдена или была перемещена.
          </p>

          {/* Кнопка возврата */}
          <Link
            href="/sign-in"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

