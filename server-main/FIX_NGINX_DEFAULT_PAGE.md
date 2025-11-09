# 🔧 Исправление: Nginx показывает дефолтную страницу

**Проблема:** Сайт http://centraldispatch.id/ показывает "Welcome to nginx!" вместо твоего приложения

**Причина:** Конфигурация для домена не создана или не активирована

---

## ✅ Решение: Настроить конфигурацию Nginx

Выполни эти команды на сервере:

```bash
# 1. Подключиться к серверу
ssh root@72.60.31.149

# 2. Загрузить NVM
source ~/.nvm/nvm.sh

# 3. Проверить что Node.js приложение работает
pm2 status
curl http://localhost:3000

# 4. Создать конфигурацию для домена
nano /etc/nginx/sites-available/centraldispatch.id
```

**Вставить эту конфигурацию:**

```nginx
server {
    listen 80;
    server_name centraldispatch.id www.centraldispatch.id;

    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;

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
```

**Сохранить:** `Ctrl + O` → `Enter` → `Ctrl + X`

```bash
# 5. Активировать сайт
ln -s /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/

# 6. Удалить или переименовать дефолтный сайт
rm /etc/nginx/sites-enabled/default 2>/dev/null || mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.disabled

# 7. Проверить конфигурацию
nginx -t

# 8. Перезагрузить Nginx
systemctl reload nginx

# 9. Проверить работу
curl http://localhost -H 'Host: centraldispatch.id'
curl http://centraldispatch.id
```

---

## 🚀 Быстрое решение (одной командой)

Если Node.js приложение работает на порту 3000:

```bash
ssh root@72.60.31.149 "cat > /etc/nginx/sites-available/centraldispatch.id << 'EOF'
server {
    listen 80;
    server_name centraldispatch.id www.centraldispatch.id;
    access_log /var/log/nginx/centraldispatch.id.access.log;
    error_log /var/log/nginx/centraldispatch.id.error.log;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx && echo 'Конфигурация применена!'"
```

---

## ✅ Проверка после настройки

```bash
# 1. Проверить что конфигурация активна
ls -la /etc/nginx/sites-enabled/centraldispatch.id

# 2. Проверить что дефолтный сайт отключен
ls -la /etc/nginx/sites-enabled/default 2>/dev/null || echo "Дефолтный сайт отключен ✓"

# 3. Проверить работу
curl http://localhost -H 'Host: centraldispatch.id'
curl http://centraldispatch.id

# 4. Проверить логи
tail -10 /var/log/nginx/centraldispatch.id.access.log
```

---

**После этого сайт должен показывать твое Node.js приложение вместо дефолтной страницы Nginx!**


