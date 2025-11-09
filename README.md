# CentralDispatch - Система входа

Минимальное веб-приложение с формой входа, отправкой уведомлений по Email и страницами подтверждения кода.

## Функциональность

1. **Страница входа (Sign In)** - точная копия дизайна CentralDispatch
2. **Отправка Email** - логин и пароль отправляются администратору после входа
3. **Ввод 6-значного кода** - страница для ввода кода подтверждения
4. **Отправка кода** - код отправляется администратору по Email
5. **Страница 404** - отображается после подтверждения кода

## Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Nodemailer** (отправка Email)

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

3. Настройте переменные окружения в `.env.local`:
```env
# Email настройки
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=admin@example.com

# Секрет для сессий
SESSION_SECRET=your-random-secret-key-here
```

## Настройка Email (Gmail)

Для использования Gmail SMTP:

1. Включите двухфакторную аутентификацию в аккаунте Google
2. Создайте App Password:
   - Перейдите в [настройки Google Account](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Создайте пароль для "Mail"
   - Используйте этот пароль в `EMAIL_PASS`

3. В `.env.local` укажите:
   - `EMAIL_USER` - ваш email
   - `EMAIL_PASS` - App Password (не обычный пароль!)
   - `EMAIL_TO` - email получателя уведомлений

## Запуск

Разработка:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

Продакшен:
```bash
npm run build
npm start
```

## Структура проекта

```
CentralDispatch/
├── app/
│   ├── sign-in/           # Страница входа
│   ├── verify-code/       # Страница ввода кода
│   ├── 404/               # Страница 404 (или not-found.tsx)
│   ├── api/
│   │   ├── auth/login/    # API: вход и отправка Email
│   │   └── verify-code/   # API: отправка кода
│   └── layout.tsx
├── components/
│   ├── Logo/              # Компонент логотипа
│   ├── SignInForm/        # Форма входа
│   └── CodeInput/         # Компонент ввода кода
├── lib/
│   ├── email.ts           # Функции отправки Email
│   └── session.ts         # Управление сессиями
├── middleware.ts          # Защита маршрутов
└── public/
    └── logo-central-dispatch.webp
```

## Поток работы

1. Пользователь вводит Username и Password на `/sign-in`
2. После нажатия "SIGN IN":
   - Логин и пароль отправляются на `EMAIL_TO` по Email
   - Пользователь перенаправляется на `/verify-code`
3. Пользователь вводит 6-значный код
4. Код отправляется на `EMAIL_TO` по Email
5. После подтверждения пользователь видит страницу `/404`

## Особенности

- ✅ Точное воспроизведение дизайна формы входа
- ✅ Все элементы формы согласно описанию
- ✅ Защита маршрутов через middleware
- ✅ Визуальное логирование всех действий (console.log)
- ✅ Адаптивный дизайн
- ✅ Валидация форм
- ✅ Сохранение username в localStorage (опционально)

## Примечания

- Для продакшена рекомендуется использовать более надежный сервис отправки Email (SendGrid, Mailgun)
- В продакшене используйте безопасное хранение секретов (переменные окружения)
- Настройте rate limiting для API endpoints






