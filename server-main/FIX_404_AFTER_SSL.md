# 🔧 Исправление 404 Not Found после установки SSL

**Проблема:** После установки SSL сертификата через Certbot сайт показывает `404 Not Found nginx/1.24.0 (Ubuntu)`

**Причина:** Certbot мог перезаписать конфигурацию Nginx и убрать настройки `proxy_pass` для Node.js приложения.

---

## 🚨 Быстрая диагностика

Выполни эти команды на сервере:

```bash
# 1. Проверить что Node.js приложение работает
pm2 status
curl http://localhost:3000

# 2. Проверить текущую конфигурацию Nginx
sudo cat /etc/nginx/sites-available/centraldispatch.id

# 3. Проверить есть ли proxy_pass в конфигурации
sudo grep -A 5 "location /" /etc/nginx/sites-available/centraldispatch.id | grep proxy_pass
```

**Если `proxy_pass` отсутствует** — это и есть проблема! Certbot создал конфигурацию без проксирования.

---

## ✅ Решение: Восстановить proxy_pass в конфигурации

### Вариант 1: Ручное исправление (Рекомендуется)

```bash
# 1. Открыть конфигурацию
sudo nano /etc/nginx/sites-available/centraldispatch.id
```

**Найди блоки `server` для портов 80 и 443. Они должны выглядеть так:**

```nginx
# HTTP сервер (редирект на HTTPS)
server {
    listen 80;
    server_name centraldispatch.id www.centraldispatch.id;
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    server_name centraldispatch.id www.centraldispatch.id;

    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Логи
    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;

    # ⚠️ ВАЖНО: Добавить блок location / с proxy_pass
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
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Сохранить:** `Ctrl + O` → `Enter` → `Ctrl + X`

### Вариант 2: Автоматическое исправление (скрипт)

```bash
# Создать скрипт для исправления
cat > /tmp/fix_nginx_proxy.sh << 'EOF'
#!/bin/bash

CONFIG_FILE="/etc/nginx/sites-available/centraldispatch.id"

# Проверить что файл существует
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Файл $CONFIG_FILE не найден!"
    exit 1
fi

# Создать резервную копию
sudo cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Проверить есть ли уже proxy_pass
if grep -q "proxy_pass http://localhost:3000" "$CONFIG_FILE"; then
    echo "✅ proxy_pass уже настроен"
    exit 0
fi

# Найти блок server для HTTPS (443) и добавить location /
# Это сложная операция, лучше сделать вручную через nano
echo "⚠️  Автоматическое исправление сложно. Используй вариант 1 (nano)"
echo "Открой файл: sudo nano $CONFIG_FILE"
echo "И добавь блок location / с proxy_pass в server блок для порта 443"
EOF

chmod +x /tmp/fix_nginx_proxy.sh
sudo /tmp/fix_nginx_proxy.sh
```

---

## ✅ Шаг 3: Проверить и перезагрузить Nginx

```bash
# 1. Проверить конфигурацию
sudo nginx -t

# Должно показать:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 2. Если тест успешен, перезагрузить
sudo systemctl reload nginx

# 3. Проверить статус
sudo systemctl status nginx
```

---

## ✅ Шаг 4: Проверить работу

```bash
# 1. Проверить что Node.js приложение работает
curl http://localhost:3000

# 2. Проверить через HTTPS (локально)
curl -k https://localhost -H 'Host: centraldispatch.id'

# 3. Проверить через домен (из браузера)
# Открой: https://centraldispatch.id
```

---

## 🔍 Если всё ещё не работает

### Проверка 1: Node.js приложение запущено?

```bash
# Проверить PM2
pm2 status

# Если не запущено, запустить:
cd /var/www/centraldispatch.id
source ~/.nvm/nvm.sh
pm2 start npm --name "centraldispatch-nextjs" -- start
# или
pm2 start app.js --name "centraldispatch-server"
pm2 save
```

### Проверка 2: Правильный порт?

```bash
# Проверить на каком порту слушает приложение
netstat -tlnp | grep node
# или
ss -tlnp | grep node

# Если порт не 3000, либо:
# 1. Изменить PORT в .env
# 2. Или изменить proxy_pass в Nginx
```

### Проверка 3: Логи Nginx

```bash
# Проверить ошибки
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/centraldispatch.id.error.log

# Проверить access логи
sudo tail -50 /var/log/nginx/centraldispatch.id.access.log
```

### Проверка 4: Правильный server_name?

```bash
# Проверить что server_name правильный
sudo grep "server_name" /etc/nginx/sites-available/centraldispatch.id

# Должно быть:
# server_name centraldispatch.id www.centraldispatch.id;
```

---

## 📝 Полная правильная конфигурация

Вот полная конфигурация, которая должна быть в `/etc/nginx/sites-available/centraldispatch.id`:

```nginx
# HTTP сервер - редирект на HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name centraldispatch.id www.centraldispatch.id;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name centraldispatch.id www.centraldispatch.id;

    # SSL сертификаты (установлены Certbot)
    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Логи
    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;

    # ⚠️ ВАЖНО: Проксирование на Node.js приложение
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
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## ✅ Чеклист исправления

- [ ] Проверил что Node.js приложение запущено (`pm2 status`)
- [ ] Проверил что приложение отвечает локально (`curl http://localhost:3000`)
- [ ] Открыл конфигурацию Nginx (`sudo nano /etc/nginx/sites-available/centraldispatch.id`)
- [ ] Добавил блок `location /` с `proxy_pass http://localhost:3000` в HTTPS server блок
- [ ] Проверил конфигурацию (`sudo nginx -t`)
- [ ] Перезагрузил Nginx (`sudo systemctl reload nginx`)
- [ ] Проверил работу сайта (`https://centraldispatch.id`)

---

**После выполнения этих шагов сайт должен работать!** 🎉

