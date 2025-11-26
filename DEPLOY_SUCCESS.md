# ✅ Проект успешно загружен на сервер 31.97.214.136

## 📋 Что было сделано

### 1. Установка окружения
- ✅ Установлен NVM (Node Version Manager)
- ✅ Установлен Node.js v20.19.6
- ✅ Установлен PM2 (Process Manager)
- ✅ Установлен Nginx (веб-сервер)

### 2. Загрузка проекта
- ✅ Код загружен через Git из репозитория: `https://github.com/kargabrielyan/cd.git`
- ✅ Проект размещен в: `/var/www/centraldispatch.id`
- ✅ Установлены зависимости: `npm install`
- ✅ Проект собран: `npm run build`

### 3. Настройка приложения
- ✅ Создан `ecosystem.config.js` с переменными окружения
- ✅ Приложение запущено через PM2
- ✅ Настроен автозапуск PM2 при перезагрузке сервера

### 4. Настройка Nginx
- ✅ Создана конфигурация для домена: `centralldispatch.id`
- ✅ Настроено проксирование на порт 3000
- ✅ Настроены заголовки безопасности

### 5. Настройка Telegram
- ✅ Webhook настроен на: `https://centralldispatch.id/api/telegram/webhook`
- ✅ Bot Token: `8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs`
- ✅ Chat ID: `5257327001`

## 🌐 Доступ к сайту

### По IP адресу
```
http://31.97.214.136
```

### По домену (когда DNS настроен)
```
http://centralldispatch.id
https://centralldispatch.id (после установки SSL)
```

## 🔧 Управление приложением

### Проверить статус
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 status"
```

### Просмотр логов
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 logs centraldispatch-nextjs"
```

### Перезапуск приложения
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 restart centraldispatch-nextjs"
```

### Остановка приложения
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 stop centraldispatch-nextjs"
```

## 🔄 Обновление кода

Для обновления кода на сервере выполните:

```bash
# 1. Закоммитить изменения локально
git add .
git commit -m "Update description"
git push origin main

# 2. Обновить на сервере
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && cd /var/www/centraldispatch.id && git pull origin main && npm install && rm -rf .next && npm run build && pm2 restart centraldispatch-nextjs --update-env && pm2 save && echo '✅ Обновление завершено!'"
```

## 🔐 Настройка SSL (следующий шаг)

Для установки SSL сертификата используйте Certbot:

```bash
ssh root@31.97.214.136 "apt install -y certbot python3-certbot-nginx && certbot --nginx -d centralldispatch.id -d www.centralldispatch.id"
```

**Важно:** DNS домена `centralldispatch.id` должен указывать на IP `31.97.214.136`

## 📊 Текущий статус

- **Сервер**: 31.97.214.136
- **Порт приложения**: 3000
- **Порт Nginx**: 80 (HTTP)
- **Статус PM2**: ✅ Online
- **Статус Nginx**: ✅ Active
- **Telegram Webhook**: ✅ Настроен

## 🎉 Что дальше?

1. **Настроить DNS** - укажите A-запись домена `centralldispatch.id` на IP `31.97.214.136`
2. **Установить SSL** - после настройки DNS установите SSL сертификат через Certbot
3. **Протестировать функционал** - проверьте работу входа и Telegram уведомлений

## 📝 Важные файлы на сервере

- Проект: `/var/www/centraldispatch.id`
- Конфигурация PM2: `/var/www/centraldispatch.id/ecosystem.config.js`
- Конфигурация Nginx: `/etc/nginx/sites-available/centralldispatch.id`
- Логи PM2: `/var/www/centraldispatch.id/logs/`
- Логи Nginx: `/var/log/nginx/centralldispatch-*.log`

## 🆘 Если что-то не работает

### Проверить логи PM2
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 logs centraldispatch-nextjs --lines 50"
```

### Проверить логи Nginx
```bash
ssh root@31.97.214.136 "tail -50 /var/log/nginx/centralldispatch-error.log"
```

### Проверить статус Nginx
```bash
ssh root@31.97.214.136 "systemctl status nginx"
```

### Перезапустить все
```bash
ssh root@31.97.214.136 "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && pm2 restart centraldispatch-nextjs && systemctl restart nginx"
```

---

**Дата развертывания**: 26 ноября 2025
**Домен**: http://centralldispatch.id (с двумя "l")
**IP**: 31.97.214.136

