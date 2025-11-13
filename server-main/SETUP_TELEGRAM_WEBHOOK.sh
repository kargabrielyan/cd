#!/bin/bash
# Скрипт для настройки Telegram webhook на сервере

BOT_TOKEN="8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs"
WEBHOOK_URL="https://centraldispatch.id/api/telegram/webhook"

echo "🔧 Настройка Telegram webhook..."

# Установка webhook
echo "📤 Установка webhook..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

echo "Ответ от Telegram API:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Проверка webhook
echo ""
echo "🔍 Проверка webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")

echo "Информация о webhook:"
echo "$WEBHOOK_INFO" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_INFO"

echo ""
echo "✅ Готово! Webhook настроен на: ${WEBHOOK_URL}"

