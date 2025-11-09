# 🔧 Исправление домена: centraldispatch.id.id → centraldispatch.id

**Проблема:** В конфигурации Nginx встречается ошибочный домен `centraldispatch.id.id` (двойной `.id`)

**Решение:** Найти и исправить все вхождения на правильный домен `centraldispatch.id`

---

## 🚀 Вариант 1: Автоматизированный скрипт (Рекомендуется)

### Шаг 1: Подключиться к серверу

```bash
ssh root@72.60.31.149
# или
ssh centraldispatch
```

### Шаг 2: Загрузить скрипт на сервер

**Вариант A: Скопировать скрипт через scp (с локального компьютера):**

```bash
# С локального компьютера (Windows PowerShell)
scp server-main/FIX_DOUBLE_ID_DOMAIN.sh root@72.60.31.149:/root/
```

**Вариант B: Создать скрипт прямо на сервере:**

```bash
# На сервере
nano /root/FIX_DOUBLE_ID_DOMAIN.sh
# Вставить содержимое скрипта, сохранить (Ctrl+O, Enter, Ctrl+X)
chmod +x /root/FIX_DOUBLE_ID_DOMAIN.sh
```

### Шаг 3: Запустить скрипт

```bash
sudo /root/FIX_DOUBLE_ID_DOMAIN.sh
```

Скрипт автоматически:
- ✅ Найдет все вхождения `centraldispatch.id.id`
- ✅ Создаст резервные копии
- ✅ Удалит проблемные файлы
- ✅ Исправит основной vhost файл
- ✅ Проверит конфигурацию
- ✅ Перезагрузит Nginx
- ✅ Проверит DNS

---

## 🔨 Вариант 2: Пошаговые команды вручную

### Шаг 1: Подключиться к серверу

```bash
ssh root@72.60.31.149
# или
ssh centraldispatch
```

### Шаг 2: Найти все вхождения

```bash
sudo grep -R --line-number "centraldispatch.id.id" /etc/nginx
```

**Ожидаемый результат:** Список файлов и строк с проблемным доменом

### Шаг 3: Создать резервные копии

```bash
# Создать директорию для бэкапов
BACKUP_DIR="/root/nginx_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Скопировать все конфигурации Nginx
sudo cp -r /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null || true
sudo cp -r /etc/nginx/sites-enabled/* "$BACKUP_DIR/" 2>/dev/null || true

echo "Резервные копии созданы в: $BACKUP_DIR"
```

### Шаг 4: Удалить проблемный файл и симлинк

```bash
# Удалить файл с неправильным доменом
sudo rm -f /etc/nginx/sites-available/centraldispatch.id.id

# Удалить симлинк (если есть)
sudo rm -f /etc/nginx/sites-enabled/centraldispatch.id.id

# Проверить что удалено
ls -la /etc/nginx/sites-available/ | grep centraldispatch
ls -la /etc/nginx/sites-enabled/ | grep centraldispatch
```

### Шаг 5: Исправить основной vhost файл

```bash
# Проверить существующие файлы
ls -la /etc/nginx/sites-available/centraldispatch*

# Если есть /etc/nginx/sites-available/centraldispatch.conf
sudo nano /etc/nginx/sites-available/centraldispatch.conf
```

**Убедиться что в файле:**
```nginx
server_name centraldispatch.id www.centraldispatch.id;
```

**Исправить автоматически (если нужно):**
```bash
# Заменить все вхождения
sudo sed -i 's/centraldispatch\.id\.id/centraldispatch.id/g' /etc/nginx/sites-available/centraldispatch.conf
sudo sed -i 's/www\.centraldispatch\.id\.id/www.centraldispatch.id/g' /etc/nginx/sites-available/centraldispatch.conf

# Проверить результат
sudo grep "server_name" /etc/nginx/sites-available/centraldispatch.conf
```

### Шаг 6: Проверить конфигурацию Nginx

```bash
sudo nginx -t
```

**Ожидаемый результат:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Шаг 7: Перезагрузить Nginx

```bash
sudo systemctl reload nginx
```

**Проверить статус:**
```bash
sudo systemctl status nginx
```

### Шаг 8: Проверить DNS

```bash
dig +short centraldispatch.id
```

**Ожидаемый результат:** IP адрес вашего VPS (например, `72.60.31.149`)

### Шаг 9: Финальная проверка

```bash
# Убедиться что нет больше вхождений centraldispatch.id.id
sudo grep -R "centraldispatch.id.id" /etc/nginx

# Должно быть пусто (или "No such file or directory")

# Проверить правильные конфигурации
sudo grep -R "server_name.*centraldispatch.id" /etc/nginx/sites-available/ | grep -v "centraldispatch.id.id"
```

---

## 🔐 Шаг 10: Установка SSL сертификата (Certbot)

После исправления домена можно установить SSL:

### Сначала тестовый запуск (dry-run):

```bash
sudo certbot certonly --nginx -d centraldispatch.id -d www.centraldispatch.id --dry-run
```

**Примечание:** Для dry-run нужно использовать подкоманду `certonly`, а не просто `--nginx`

**Ожидаемый результат:**
```
The dry run was successful.
```

### Если dry-run успешен, запустить реальную установку:

**Если уже есть сертификат для centraldispatch.id, используй флаг `--expand`:**

```bash
sudo certbot --nginx -d centraldispatch.id -d www.centraldispatch.id \
  --non-interactive \
  --agree-tos \
  --email admin@centraldispatch.id \
  --redirect \
  --expand
```

**Если сертификата еще нет, команда без `--expand`:**

```bash
sudo certbot --nginx -d centraldispatch.id -d www.centraldispatch.id \
  --non-interactive \
  --agree-tos \
  --email admin@centraldispatch.id \
  --redirect
```

**Примечание:** Если используешь Cloudflare Proxy, после установки SSL нужно обновить конфигурацию (см. `5.DOMAIN_SETUP_CLOUDFLARE.md`)

---

## ✅ Чеклист проверки

После выполнения всех шагов проверь:

- [ ] Нет вхождений `centraldispatch.id.id` в `/etc/nginx`
- [ ] Файл `/etc/nginx/sites-available/centraldispatch.id.id` удален
- [ ] Симлинк `/etc/nginx/sites-enabled/centraldispatch.id.id` удален
- [ ] В основном vhost файле `server_name = centraldispatch.id www.centraldispatch.id`
- [ ] `sudo nginx -t` проходит успешно
- [ ] `sudo systemctl status nginx` показывает `active (running)`
- [ ] DNS запись `centraldispatch.id` указывает на IP сервера
- [ ] Certbot dry-run проходит успешно

---

## 🔍 Диагностика проблем

### Проблема: Nginx не перезагружается

```bash
# Проверить логи ошибок
sudo tail -50 /var/log/nginx/error.log

# Проверить синтаксис
sudo nginx -t

# Попробовать перезапуск вместо reload
sudo systemctl restart nginx
```

### Проблема: DNS не работает

```bash
# Проверить DNS с разных серверов
dig +short @8.8.8.8 centraldispatch.id
dig +short @1.1.1.1 centraldispatch.id

# Проверить настройки DNS в панели управления доменом
```

### Проблема: Certbot не работает

```bash
# Проверить что порт 80 открыт
sudo netstat -tulpn | grep :80

# Проверить что Nginx слушает порт 80
sudo ss -tulpn | grep :80

# Проверить firewall
sudo ufw status
```

---

## 📝 Полезные команды

```bash
# Просмотр всех конфигураций Nginx
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Просмотр содержимого конфигурации
sudo cat /etc/nginx/sites-available/centraldispatch.conf

# Проверка активных сайтов
sudo nginx -T | grep "server_name"

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 💾 Восстановление из резервной копии

Если что-то пошло не так, можно восстановить:

```bash
# Найти резервную копию
ls -la /root/nginx_backup_*

# Восстановить файл
sudo cp /root/nginx_backup_YYYYMMDD_HHMMSS/centraldispatch.conf /etc/nginx/sites-available/

# Проверить и перезагрузить
sudo nginx -t
sudo systemctl reload nginx
```

---

**Готово!** После выполнения всех шагов домен должен работать корректно. 🎉

