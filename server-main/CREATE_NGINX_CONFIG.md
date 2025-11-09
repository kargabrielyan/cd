# 🔧 Создание конфигурации Nginx для centraldispatch.id

**Проблема:** Файл `/etc/nginx/sites-available/centraldispatch.id` не существует

**Решение:** Создать правильную конфигурацию с SSL и proxy_pass

---

## 🚨 Шаг 1: Проверить что есть

Выполни на сервере:

```bash
# 1. Проверить какие конфигурации есть
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# 2. Проверить что Certbot создал (может быть в другом месте)
sudo certbot certificates

# 3. Проверить активные конфигурации
sudo nginx -T | grep "server_name"
```

---

## ✅ Шаг 2: Создать конфигурацию

### Вариант 1: Через команду cat (быстро)

```bash
# Создать конфигурацию
sudo cat > /etc/nginx/sites-available/centraldispatch.id << 'EOF'
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
EOF
```

### Вариант 2: Через nano (если нужно редактировать)

```bash
# Создать файл
sudo nano /etc/nginx/sites-available/centraldispatch.id

# Вставить конфигурацию из варианта 1
# Сохранить: Ctrl + O → Enter → Ctrl + X
```

---

## ✅ Шаг 3: Активировать конфигурацию

```bash
# 1. Создать символическую ссылку
sudo ln -sf /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/

# 2. Удалить дефолтный сайт (если мешает)
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Проверить конфигурацию
sudo nginx -t

# Должно показать:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## ✅ Шаг 4: Перезагрузить Nginx

```bash
# Перезагрузить
sudo systemctl reload nginx

# Проверить статус
sudo systemctl status nginx
```

---

## ✅ Шаг 5: Проверить работу

```bash
# 1. Проверить что Node.js приложение работает
pm2 status
curl http://localhost:3000

# 2. Проверить через HTTPS (локально)
curl -k https://localhost -H 'Host: centraldispatch.id'

# 3. Открыть в браузере
# https://centraldispatch.id
```

---

## 🔍 Если SSL сертификаты в другом месте

Если Certbot создал сертификаты с другим именем, проверь:

```bash
# Посмотреть все сертификаты
sudo certbot certificates

# Посмотреть где сертификаты
ls -la /etc/letsencrypt/live/

# Если сертификат называется по-другому, измени пути в конфигурации:
# ssl_certificate /etc/letsencrypt/live/ДРУГОЕ_ИМЯ/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/ДРУГОЕ_ИМЯ/privkey.pem;
```

---

## 🐛 Если ошибка "SSL certificate not found"

Если сертификаты не найдены, нужно установить их заново:

```bash
# Установить сертификат
sudo certbot --nginx -d centraldispatch.id -d www.centraldispatch.id \
  --non-interactive \
  --agree-tos \
  --email admin@centraldispatch.id \
  --expand

# После установки Certbot может перезаписать конфигурацию
# Нужно будет снова добавить proxy_pass (см. FIX_404_AFTER_SSL.md)
```

---

## ✅ Чеклист

- [ ] Проверил какие конфигурации есть (`ls /etc/nginx/sites-available/`)
- [ ] Создал файл `/etc/nginx/sites-available/centraldispatch.id`
- [ ] Добавил блок `location /` с `proxy_pass http://localhost:3000`
- [ ] Активировал конфигурацию (`ln -s`)
- [ ] Проверил конфигурацию (`nginx -t`)
- [ ] Перезагрузил Nginx (`systemctl reload nginx`)
- [ ] Проверил работу сайта (`https://centraldispatch.id`)

---

**После выполнения этих шагов сайт должен работать!** 🎉

