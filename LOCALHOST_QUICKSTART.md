# 🚀 Быстрый старт для localhost

## ⚠️ Важно!

Telegram **не может** отправлять webhook на `localhost`. Для работы на localhost нужен **ngrok** или другой туннель.

## Шаги для запуска на localhost

### 1. Создать .env.local файл

Создай файл `.env.local` в корне проекта:

```env
TELEGRAM_BOT_TOKEN=8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs
TELEGRAM_CHAT_ID=5257327001
NODE_ENV=development
PORT=3000
```

### 2. Установить ngrok

**Windows:**
- Скачай с https://ngrok.com/download
- Или через Chocolatey: `choco install ngrok`

**Mac:**
```bash
brew install ngrok
```

### 3. Запустить ngrok туннель

В отдельном терминале:
```bash
ngrok http 3000
```

Скопируй **HTTPS URL** (например: `https://abc123.ngrok.io`)

### 4. Настроить webhook на ngrok URL

```bash
curl -X POST "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://ВАШ_NGROK_URL.ngrok.io/api/telegram/webhook"
```

Или открой в браузере:
```
https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://ВАШ_NGROK_URL.ngrok.io/api/telegram/webhook
```

### 5. Запустить приложение

```bash
npm run dev
```

### 6. Проверить работу

1. Открой `http://localhost:3000/sign-in`
2. Введи username и password
3. Нажми SIGN IN
4. Должен появиться круговой loading
5. Проверь Telegram - должно прийти сообщение с кнопками YES/NO

## ⚠️ Важные замечания

1. **ngrok URL меняется** при каждом перезапуске (на бесплатном плане)
2. После каждого перезапуска ngrok нужно **обновить webhook** с новым URL
3. Для постоянного URL используй ngrok с авторизацией

## Проверка webhook

```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
```

Должен вернуть ваш ngrok URL.

## Альтернатива без ngrok

Если не хочешь использовать ngrok, можно временно протестировать на сервере, где уже настроен домен.

