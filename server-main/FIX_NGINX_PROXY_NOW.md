# 🚀 Быстрое исправление: Nginx проксирование на Node.js

**Проблема:** При обращении к `http://centraldispatch.id.id` показывается дефолтная страница nginx вместо Node.js приложения.

**Решение:** Настроить nginx для проксирования запросов на `localhost:3000`

---

## ⚡ Быстрое решение (выполнить на сервере)

Выполни эти команды на сервере через SSH:

```bash
# 1. Проверить что Node.js приложение работает
curl http://localhost:3000

# 2. Проверить текущие конфигурации nginx
ls -la /etc/nginx/sites-enabled/

# 3. Создать конфигурацию для домена
# ⚠️ ВАЖНО: Замени centraldispatch.id.id на правильный домен, если нужно!
cat > /etc/nginx/sites-available/centraldispatch.id.id << 'EOF'
server {
    listen 80;
    server_name centraldispatch.id.id www.centraldispatch.id.id;

    # Логи
    access_log /var/log/nginx/centraldispatch.id.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.id.error.log;

    # Прокси на Node.js приложение (порт 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket поддержка
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Базовые заголовки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cloudflare Proxy поддержка (если используется)
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        proxy_set_header CF-Visitor $http_cf_visitor;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Кеширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 4. Активировать сайт
ln -sf /etc/nginx/sites-available/centraldispatch.id.id /etc/nginx/sites-enabled/

# 5. Отключить дефолтный сайт (если он мешает)
rm -f /etc/nginx/sites-enabled/default

# 6. Проверить конфигурацию (ВАЖНО!)
nginx -t

# 7. Если тест успешен, перезагрузить nginx
systemctl reload nginx

# 8. Проверить работу
curl http://localhost -H 'Host: centraldispatch.id.id'
curl http://centraldispatch.id.id
```

---

## 🔍 Если домен другой (например, centraldispatch.id без .id.id)

Если правильный домен `centraldispatch.id` (без второго `.id`), выполни:

```bash
# Создать конфигурацию для правильного домена
cat > /etc/nginx/sites-available/centraldispatch.id << 'EOF'
server {
    listen 80;
    server_name centraldispatch.id www.centraldispatch.id;

    # Логи
    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;

    # Прокси на Node.js приложение (порт 3000)
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
        
        # Cloudflare Proxy поддержка
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        proxy_set_header CF-Visitor $http_cf_visitor;
    }
}
EOF

# Активировать
ln -sf /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
curl http://centraldispatch.id
```

---

## ✅ Проверка после настройки

```bash
# 1. Проверить что конфигурация активна
ls -la /etc/nginx/sites-enabled/ | grep centraldispatch

# 2. Проверить статус nginx
systemctl status nginx

# 3. Проверить работу приложения
curl http://localhost:3000
curl http://centraldispatch.id.id  # или centraldispatch.id

# 4. Проверить логи (если есть ошибки)
tail -20 /var/log/nginx/error.log
tail -20 /var/log/nginx/centraldispatch.id.id.error.log
```

---

## 🐛 Если что-то пошло не так

### Ошибка SSL сертификата

Если видишь ошибку:
```
cannot load certificate "/etc/letsencrypt/live/centraldispatch.id/fullchain.pem": 
BIO_new_file() failed
nginx: configuration file /etc/nginx/nginx.conf test failed
```

**Решение:** Смотри подробную инструкцию в [`FIX_NGINX_SSL_ERROR.md`](./FIX_NGINX_SSL_ERROR.md)

**Быстрое исправление:**
```bash
# Найти проблемные конфигурации
grep -r "ssl_certificate.*centraldispatch.id" /etc/nginx/sites-enabled/
grep -r "ssl_certificate.*centraldispatch.id" /etc/nginx/sites-available/

# Удалить старые конфигурации с SSL
rm -f /etc/nginx/sites-enabled/centraldispatch.id*
rm -f /etc/nginx/sites-available/centraldispatch.id*

# Создать новую конфигурацию БЕЗ SSL (см. команды выше)
# Затем:
nginx -t && systemctl reload nginx
```

### Другие проблемы

```bash
# Откатить изменения
rm -f /etc/nginx/sites-enabled/centraldispatch.id.id
rm -f /etc/nginx/sites-available/centraldispatch.id.id
systemctl reload nginx

# Проверить логи nginx
tail -50 /var/log/nginx/error.log

# Проверить что Node.js приложение работает
pm2 status
pm2 logs centraldispatch-server --lines 50
```

---

**После выполнения этих команд сайт должен показывать твое Node.js приложение!** 🎉

