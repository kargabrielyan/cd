# ⚡ Быстрая загрузка проекта на сервер

## 🚀 Одна команда для обновления

Выполните на локальной машине (в PowerShell):

```powershell
ssh centraldispatch "source ~/.nvm/nvm.sh && cd /var/www/centraldispatch.id && git pull origin main && npm install && rm -rf .next && npm run build && pm2 restart centraldispatch-nextjs --update-env && pm2 save && echo '✅ Обновление завершено!'"
```

## 📋 Или пошагово:

### 1. На сервере - обновить код

```bash
ssh centraldispatch
cd /var/www/centraldispatch.id
source ~/.nvm/nvm.sh
git pull origin main
npm install
rm -rf .next
npm run build
```

### 2. Настроить Telegram переменные

Файл `ecosystem.config.js` уже содержит токены. Просто перезапустите:

```bash
pm2 restart centraldispatch-nextjs --update-env
pm2 save
```

### 3. Настроить Webhook

```bash
curl -X POST "https://api.telegram.org/bot8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs/setWebhook?url=https://centraldispatch.id/api/telegram/webhook"
```

### 4. Проверить

```bash
pm2 status
pm2 logs centraldispatch-nextjs --lines 10
```

## ✅ Готово!

Теперь откройте https://centraldispatch.id/sign-in и протестируйте вход.

