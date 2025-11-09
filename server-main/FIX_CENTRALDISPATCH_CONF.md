# 🔧 Исправление конфигурации centraldispatch.conf

**Проблема:** Файл конфигурации называется `centraldispatch.conf` (не `centraldispatch.id`)

**Решение:** Проверить содержимое и добавить `proxy_pass` для Node.js приложения

---

## 🚨 Шаг 1: Проверить текущую конфигурацию

```bash
# Посмотреть содержимое файла
sudo cat /etc/nginx/sites-available/centraldispatch.conf

# Проверить есть ли proxy_pass
sudo grep "proxy_pass" /etc/nginx/sites-available/centraldispatch.conf
```

---

## ✅ Шаг 2: Исправить конфигурацию

### Если proxy_pass отсутствует:

```bash
# Создать резервную копию
sudo cp /etc/nginx/sites-available/centraldispatch.conf /etc/nginx/sites-available/centraldispatch.conf.backup

# Открыть для редактирования
sudo nano /etc/nginx/sites-available/centraldispatch.conf
```

**В блоке `server` для порта 443 (HTTPS) должен быть блок `location /`:**

```nginx
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
    
    # Cloudflare Proxy поддержка
    proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
    proxy_set_header CF-Ray $http_cf_ray;
    proxy_set_header CF-Visitor $http_cf_visitor;
    
    # Таймауты
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Сохранить:** `Ctrl + O` → `Enter` → `Ctrl + X`

---

## ✅ Шаг 3: Проверить и перезагрузить

```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## 📝 Полная правильная конфигурация

Если нужно пересоздать файл полностью:

```bash
# Создать резервную копию
sudo cp /etc/nginx/sites-available/centraldispatch.conf /etc/nginx/sites-available/centraldispatch.conf.backup

# Создать правильную конфигурацию
sudo cat > /etc/nginx/sites-available/centraldispatch.conf << 'EOF'
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

    # Проксирование на Node.js приложение
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
        
        # Cloudflare Proxy поддержка
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

---

## ✅ Чеклист

- [ ] Проверил содержимое файла (`cat /etc/nginx/sites-available/centraldispatch.conf`)
- [ ] Проверил есть ли `proxy_pass` (`grep proxy_pass`)
- [ ] Добавил блок `location /` с `proxy_pass http://localhost:3000` в HTTPS server блок
- [ ] Проверил конфигурацию (`nginx -t`)
- [ ] Перезагрузил Nginx (`systemctl reload nginx`)
- [ ] Проверил работу сайта (`https://centraldispatch.id`)

---

**После исправления сайт должен работать!** 🎉

