# 🔍 Диагностика проблемы: "This site can't be reached"

**Проблема:** Сайт https://centraldispatch.id/ не открывается после миграции на Nginx

---

## 🚨 Быстрая диагностика (выполни все команды по порядку)

Подключись к серверу и выполни:

```bash
# 1. Подключиться к серверу
ssh root@72.60.31.149

# 2. Загрузить NVM (если нужно)
source ~/.nvm/nvm.sh 2>/dev/null || export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Проверить что Nginx запущен
systemctl is-active nginx

# 4. Проверить что Node.js приложение запущено
pm2 status

# 5. Проверить порты (80, 443, 3000)
netstat -tlnp | grep -E ':(80|443|3000)' || ss -tlnp | grep -E ':(80|443|3000)'

# 6. Проверить конфигурацию Nginx
nginx -t

# 7. Проверить что Nginx слушает порты
lsof -i :80 || netstat -tlnp | grep :80
lsof -i :443 || netstat -tlnp | grep :443

# 8. Проверить локально работает ли приложение
curl http://localhost:3000

# 9. Проверить работает ли Nginx локально
curl http://localhost

# 10. Проверить логи Nginx на ошибки
tail -30 /var/log/nginx/error.log
tail -30 /var/log/nginx/centraldispatch.id.error.log 2>/dev/null || echo "Лог сайта не найден"

# 11. Проверить firewall
ufw status | grep -E '(80|443|Nginx)'

# 12. Проверить DNS
dig +short centraldispatch.id
```

---

## ✅ Решения по результатам диагностики

### Проблема 1: Nginx не запущен

**Симптом:** `systemctl is-active nginx` показывает `inactive`

**Решение:**
```bash
# 1. Запустить Nginx
systemctl start nginx

# 2. Включить автозапуск
systemctl enable nginx

# 3. Проверить статус
systemctl is-active nginx

# 4. Проверить ошибки
journalctl -u nginx -n 50 --no-pager
```

---

### Проблема 2: Node.js приложение не запущено

**Симптом:** `pm2 status` показывает что приложение не запущено или ошибка

**Решение:**
```bash
# 1. Перейти в директорию проекта
cd /var/www/centraldispatch.id

# 2. Загрузить NVM
source ~/.nvm/nvm.sh

# 3. Проверить что приложение есть в PM2
pm2 list

# 4. Если приложения нет, запустить
pm2 start app.js --name centraldispatch-server

# 5. Или перезапустить существующее
pm2 restart centraldispatch-server

# 6. Проверить логи
pm2 logs centraldispatch-server --lines 50

# 7. Сохранить конфигурацию PM2
pm2 save
```

---

### Проблема 3: Порт 80 или 443 не слушается

**Симптом:** `netstat -tlnp | grep :80` не показывает Nginx

**Решение:**
```bash
# 1. Проверить что Nginx запущен
systemctl start nginx

# 2. Проверить конфигурацию
nginx -t

# 3. Если есть ошибки, исправить их
nano /etc/nginx/sites-available/centraldispatch.id

# 4. Перезагрузить Nginx
systemctl reload nginx

# 5. Проверить порты снова
netstat -tlnp | grep -E ':(80|443)'
```

---

### Проблема 4: Ошибки в конфигурации Nginx

**Симптом:** `nginx -t` показывает ошибки

**Решение:**
```bash
# 1. Посмотреть ошибки
nginx -t

# 2. Проверить основной файл конфигурации
cat /etc/nginx/sites-available/centraldispatch.id

# 3. Проверить что файл активирован
ls -la /etc/nginx/sites-enabled/centraldispatch.id

# 4. Если файла нет, активировать
ln -s /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/

# 5. Проверить снова
nginx -t
```

**Типичные ошибки:**
- Файл конфигурации не найден → создать файл
- Синтаксическая ошибка → исправить синтаксис
- SSL сертификаты не найдены → установить сертификаты

---

### Проблема 5: Firewall блокирует порты

**Симптом:** `ufw status` показывает что порты закрыты

**Решение:**
```bash
# 1. Открыть порты для Nginx
ufw allow 'Nginx Full'

# 2. Или вручную
ufw allow 80/tcp
ufw allow 443/tcp

# 3. Проверить статус
ufw status | grep -E '(80|443|Nginx)'

# 4. Если firewall не активен, активировать
ufw enable
```

---

### Проблема 6: SSL сертификат не работает

**Симптом:** HTTP работает, но HTTPS не работает

**Решение:**
```bash
# 1. Проверить сертификаты
ls -la /etc/letsencrypt/live/centraldispatch.id/ 2>/dev/null

# 2. Если сертификатов нет, установить
apt install -y certbot python3-certbot-nginx
certbot --nginx -d centraldispatch.id \
  --non-interactive \
  --agree-tos \
  --email admin@centraldispatch.id \
  --redirect

# 3. Проверить конфигурацию Nginx
cat /etc/nginx/sites-available/centraldispatch.id | grep ssl_certificate

# 4. Перезагрузить Nginx
systemctl reload nginx
```

---

### Проблема 7: Конфигурация Nginx неправильная

**Симптом:** Nginx работает, но сайт не отвечает

**Решение:**
```bash
# 1. Проверить текущую конфигурацию
cat /etc/nginx/sites-available/centraldispatch.id

# 2. Создать правильную конфигурацию
nano /etc/nginx/sites-available/centraldispatch.id
```

**Правильная конфигурация (HTTP):**
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
    }
}
```

**Сохранить:** `Ctrl + O` → `Enter` → `Ctrl + X`

```bash
# 3. Проверить конфигурацию
nginx -t

# 4. Перезагрузить Nginx
systemctl reload nginx

# 5. Проверить работу
curl http://localhost -H 'Host: centraldispatch.id'
```

---

### Проблема 8: OpenLiteSpeed все еще занимает порты

**Симптом:** Порты 80/443 заняты другим процессом

**Решение:**
```bash
# 1. Найти процесс на порту 80
lsof -i :80 || netstat -tlnp | grep :80

# 2. Остановить OpenLiteSpeed
systemctl stop lsws
systemctl disable lsws

# 3. Проверить что порты свободны
netstat -tlnp | grep -E ':(80|443)'

# 4. Запустить Nginx
systemctl start nginx
```

---

## 🔧 Полное решение (если ничего не помогло)

Выполни все команды по порядку:

```bash
# 1. Подключиться к серверу
ssh root@72.60.31.149

# 2. Загрузить NVM
source ~/.nvm/nvm.sh

# 3. Остановить OpenLiteSpeed (если еще работает)
systemctl stop lsws 2>/dev/null
systemctl disable lsws 2>/dev/null

# 4. Убедиться что Nginx установлен
apt install -y nginx

# 5. Запустить Nginx
systemctl start nginx
systemctl enable nginx

# 6. Проверить что Node.js приложение запущено
cd /var/www/centraldispatch.id
pm2 restart centraldispatch-server || pm2 start app.js --name centraldispatch-server
pm2 save

# 7. Проверить что приложение работает
curl http://localhost:3000

# 8. Создать/проверить конфигурацию Nginx
cat > /etc/nginx/sites-available/centraldispatch.id << 'EOF'
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
    }
}
EOF

# 9. Активировать сайт
ln -sf /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 10. Проверить конфигурацию
nginx -t

# 11. Перезагрузить Nginx
systemctl reload nginx

# 12. Открыть порты в firewall
ufw allow 'Nginx Full'

# 13. Проверить что все работает
curl http://localhost -H 'Host: centraldispatch.id'
curl http://centraldispatch.id

# 14. Установить SSL (если нужно)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d centraldispatch.id \
  --non-interactive \
  --agree-tos \
  --email admin@centraldispatch.id \
  --redirect

# 15. Финальная проверка
curl -I https://centraldispatch.id
```

---

## 📊 Проверка после исправления

```bash
# 1. Проверить что Nginx работает
systemctl is-active nginx
curl http://localhost

# 2. Проверить что Node.js работает
pm2 status
curl http://localhost:3000

# 3. Проверить порты
netstat -tlnp | grep -E ':(80|443|3000)'

# 4. Проверить конфигурацию
nginx -t

# 5. Проверить логи
tail -20 /var/log/nginx/centraldispatch.id.access.log
tail -20 /var/log/nginx/centraldispatch.id.error.log

# 6. Проверить через домен
curl -I http://centraldispatch.id
curl -I https://centraldispatch.id
```

---

## 🆘 Если все еще не работает

Выполни и отправь результаты:

```bash
# Полная диагностика
echo "=== Nginx статус ==="
systemctl is-active nginx
echo ""
echo "=== PM2 статус ==="
pm2 status
echo ""
echo "=== Порты ==="
netstat -tlnp | grep -E ':(80|443|3000)'
echo ""
echo "=== Nginx конфигурация ==="
nginx -t
echo ""
echo "=== Логи ошибок Nginx ==="
tail -30 /var/log/nginx/error.log
echo ""
echo "=== Firewall ==="
ufw status
echo ""
echo "=== Локальная проверка ==="
curl -v http://localhost:3000 2>&1 | head -20
curl -v http://localhost -H 'Host: centraldispatch.id' 2>&1 | head -20
```

---

**Важно:** Выполняй команды по порядку и проверяй результат после каждого шага!


