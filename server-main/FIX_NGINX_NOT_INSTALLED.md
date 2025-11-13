# 🔧 Исправление: Nginx не установлен

**Проблема:** `Unit nginx.service not found` - Nginx не установлен или установлен неправильно

---

## ✅ Решение: Установить Nginx правильно

Выполни эти команды на сервере:

```bash
# 1. Подключиться к серверу
ssh root@72.60.31.149

# 2. Обновить список пакетов
apt update

# 3. Установить Nginx
apt install -y nginx

# 4. Проверить что Nginx установлен
nginx -v

# 5. Запустить Nginx
systemctl start nginx

# 6. Включить автозапуск
systemctl enable nginx

# 7. Проверить статус
systemctl is-active nginx

# 8. Проверить что Nginx работает
curl http://localhost
```

---

## 🔍 Если установка не помогла

### Вариант 1: Проверить что Nginx действительно установлен

```bash
# Проверить установлен ли Nginx
which nginx
dpkg -l | grep nginx

# Если не установлен, установить
apt install -y nginx
```

### Вариант 2: Переустановить Nginx

```bash
# 1. Удалить Nginx (если установлен неправильно)
apt remove -y nginx nginx-common nginx-core 2>/dev/null
apt purge -y nginx* 2>/dev/null

# 2. Очистить кеш
apt autoremove -y
apt autoclean

# 3. Установить заново
apt update
apt install -y nginx

# 4. Запустить
systemctl start nginx
systemctl enable nginx

# 5. Проверить
systemctl is-active nginx
nginx -v
```

### Вариант 3: Проверить systemd сервис

```bash
# Проверить файл сервиса
ls -la /etc/systemd/system/multi-user.target.wants/nginx.service
ls -la /lib/systemd/system/nginx.service

# Если файлов нет, переустановить
apt remove -y nginx
apt install -y nginx

# Перезагрузить systemd
systemctl daemon-reload

# Запустить Nginx
systemctl start nginx
systemctl enable nginx
```

---

## 📋 Полная последовательность установки

Выполни все команды по порядку:

```bash
# 1. Подключиться к серверу
ssh root@72.60.31.149

# 2. Обновить систему
apt update
apt upgrade -y

# 3. Установить Nginx
apt install -y nginx

# 4. Проверить версию
nginx -v

# 5. Запустить Nginx
systemctl start nginx

# 6. Включить автозапуск
systemctl enable nginx

# 7. Проверить статус
systemctl is-active nginx

# 8. Проверить что работает
curl http://localhost

# 9. Проверить порты
netstat -tlnp | grep nginx || ss -tlnp | grep nginx

# 10. Проверить конфигурацию
nginx -t
```

---

## ✅ После установки: Настроить сайт

После того как Nginx установлен и запущен:

```bash
# 1. Создать конфигурацию сайта
nano /etc/nginx/sites-available/centraldispatch.id
```

Вставить:
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

Сохранить: `Ctrl + O` → `Enter` → `Ctrl + X`

```bash
# 2. Активировать сайт
ln -s /etc/nginx/sites-available/centraldispatch.id /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 3. Проверить конфигурацию
nginx -t

# 4. Перезагрузить Nginx
systemctl reload nginx

# 5. Проверить работу
curl http://localhost -H 'Host: centraldispatch.id'
```

---

## 🚨 Если все еще не работает

Выполни полную диагностику:

```bash
# Полная диагностика
echo "=== Проверка установки Nginx ==="
which nginx
nginx -v 2>&1
dpkg -l | grep nginx
echo ""

echo "=== Проверка systemd ==="
systemctl list-unit-files | grep nginx
ls -la /lib/systemd/system/nginx* 2>/dev/null
ls -la /etc/systemd/system/multi-user.target.wants/nginx* 2>/dev/null
echo ""

echo "=== Проверка процессов ==="
ps aux | grep nginx
echo ""

echo "=== Проверка портов ==="
netstat -tlnp | grep -E ':(80|443)'
echo ""

echo "=== Проверка логов ==="
journalctl -u nginx -n 20 --no-pager 2>/dev/null || echo "Логи не найдены"
```

---

**Важно:** После установки Nginx обязательно настрой конфигурацию для твоего сайта!






