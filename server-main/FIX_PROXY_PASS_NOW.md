# 🔧 Исправление: Заменить try_files на proxy_pass

**Проблема:** В конфигурации Nginx используется `root` и `try_files`, а не `proxy_pass` на Node.js

**Решение:** Заменить блок `location /` на проксирование

---

## ✅ Быстрое исправление

Выполни на сервере:

```bash
# Создать резервную копию
sudo cp /etc/nginx/sites-available/centraldispatch.conf /etc/nginx/sites-available/centraldispatch.conf.backup

# Исправить конфигурацию
sudo sed -i '/root \/var\/www\/centraldispatch;/d' /etc/nginx/sites-available/centraldispatch.conf
sudo sed -i '/index index.html index.htm index.php;/d' /etc/nginx/sites-available/centraldispatch.conf
sudo sed -i 's|try_files $uri $uri/ =404;|proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection '\''upgrade'\'';\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_cache_bypass $http_upgrade;\n        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;\n        proxy_set_header CF-Ray $http_cf_ray;\n        proxy_set_header CF-Visitor $http_cf_visitor;|' /etc/nginx/sites-available/centraldispatch.conf
```

**Но лучше использовать nano для точного редактирования!**

---

## ✅ Правильный способ: Редактирование через nano

```bash
# Создать резервную копию
sudo cp /etc/nginx/sites-available/centraldispatch.conf /etc/nginx/sites-available/centraldispatch.conf.backup

# Открыть для редактирования
sudo nano /etc/nginx/sites-available/centraldispatch.conf
```

**Найди блок HTTPS server (строки 191-208) и замени:**

**Было:**
```nginx
server {
    server_name centraldispatch.id www.centraldispatch.id;

    root /var/www/centraldispatch;
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

**Должно стать:**
```nginx
server {
    server_name centraldispatch.id www.centraldispatch.id;

    # УДАЛИ эти строки:
    # root /var/www/centraldispatch;
    # index index.html index.htm index.php;

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
    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

**Сохранить:** `Ctrl + O` → `Enter` → `Ctrl + X`

---

## ✅ Или пересоздать файл полностью

```bash
# Создать резервную копию
sudo cp /etc/nginx/sites-available/centraldispatch.conf /etc/nginx/sites-available/centraldispatch.conf.backup

# Создать правильную конфигурацию
sudo cat > /etc/nginx/sites-available/centraldispatch.conf << 'EOF'
# HTTP сервер - редирект на HTTPS
server {
    if ($host = www.centraldispatch.id) {
        return 301 https://$host$request_uri;
    }
    if ($host = centraldispatch.id) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name centraldispatch.id www.centraldispatch.id;
    return 404;
}

# HTTPS сервер
server {
    server_name centraldispatch.id www.centraldispatch.id;

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

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/centraldispatch.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/centraldispatch.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;
}
EOF
```

---

## ✅ Проверить и перезагрузить

```bash
# Проверить конфигурацию
sudo nginx -t

# Должно показать:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Перезагрузить Nginx
sudo systemctl reload nginx

# Проверить статус
sudo systemctl status nginx
```

---

## ✅ Проверить работу

```bash
# Проверить что Node.js приложение работает
pm2 status
curl http://localhost:3000

# Проверить через HTTPS
curl -k https://localhost -H 'Host: centraldispatch.id'
```

Открой в браузере: `https://centraldispatch.id`

---

## ✅ Чеклист

- [ ] Создал резервную копию
- [ ] Удалил строки `root` и `index` из HTTPS блока
- [ ] Заменил `try_files $uri $uri/ =404;` на `proxy_pass http://localhost:3000;`
- [ ] Добавил все необходимые `proxy_set_header`
- [ ] Проверил конфигурацию (`nginx -t`)
- [ ] Перезагрузил Nginx (`systemctl reload nginx`)
- [ ] Проверил работу сайта (`https://centraldispatch.id`)

---

**После исправления сайт должен работать!** 🎉

