# 🔧 Исправление ошибок 400 для статических файлов Next.js

**Проблема:** Ошибки 400 Bad Request для файлов `/_next/static/chunks/*.js`

**Причина:** Nginx не правильно проксирует статические файлы Next.js или проблема с конфигурацией Next.js

---

## ✅ Шаг 1: Проверить конфигурацию Nginx на сервере

```bash
# Посмотреть текущую конфигурацию
sudo cat /etc/nginx/sites-available/centraldispatch.conf
```

**Убедись что есть блок для статических файлов:**

```nginx
# Проксирование на Node.js приложение
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
    proxy_set_header CF-Ray $http_cf_ray;
    proxy_set_header CF-Visitor $http_cf_visitor;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Важно:** Все запросы (включая `/_next/static/`) должны проксироваться на `http://localhost:3000`

---

## ✅ Шаг 2: Обновить код и пересобрать

```bash
# На сервере
cd /var/www/centraldispatch.id
source ~/.nvm/nvm.sh
git pull origin main
npm install
rm -rf .next
npm run build
pm2 restart centraldispatch-nextjs
```

---

## ✅ Шаг 3: Проверить что приложение работает

```bash
# Проверить что приложение отвечает
curl http://localhost:3000

# Проверить статические файлы
curl http://localhost:3000/_next/static/chunks/main-app.js

# Проверить через домен
curl https://centraldispatch.id/_next/static/chunks/main-app.js
```

---

## 🐛 Если ошибки остаются

### Проблема: Nginx возвращает 400

```bash
# Проверить логи Nginx
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/centraldispatch.id.error.log

# Проверить логи Next.js
pm2 logs centraldispatch-nextjs --lines 50
```

### Проблема: Файлы не найдены

```bash
# Проверить что сборка успешна
ls -la .next/static/chunks/

# Если папки нет, пересобрать:
rm -rf .next
npm run build
```

### Проблема: Неправильные пути

Убедись что в `next.config.js` нет `output: 'standalone'` (это может вызывать проблемы)

---

## ✅ Правильная конфигурация Nginx

```nginx
server {
    server_name centraldispatch.id www.centraldispatch.id;

    # Проксирование ВСЕХ запросов на Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        proxy_set_header CF-Visitor $http_cf_visitor;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

**Ключевой момент:** Один блок `location /` должен проксировать ВСЕ запросы, включая `/_next/static/`

---

**После исправления ошибки 400 должны исчезнуть!** 🎉

