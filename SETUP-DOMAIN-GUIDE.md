# Настройка домена centraldispatch.id - Пошаговая инструкция

## ✅ Текущий статус (проверено):

- ✅ DNS настроен правильно: `centraldispatch.id` → `72.60.31.149`
- ✅ HTTP работает (200 OK)
- ✅ OpenLiteSpeed работает
- ✅ Next.js работает на порту 3000
- ✅ Firewall настроен

## 🔧 Что нужно сделать:

### Шаг 1: Настроить виртуальный хост в OpenLiteSpeed

1. **Откройте админ-панель:**
   ```
   http://72.60.31.149:7080
   ```
   - Логин: `admin`
   - Пароль: `TvudbthE4GCN7H6H`

2. **Создайте виртуальный хост:**
   - Перейдите: **Configuration** → **Virtual Hosts** → нажмите **Add**
   - **Virtual Host Name**: `CentralDispatch`
   - **Domains**: `centraldispatch.id, www.centraldispatch.id`
   - **Document Root**: `/root/centraldispatch`
   - **Index Files**: `index.html, index.php`
   - Нажмите **Save**

3. **Настройте Script Handler (проксирование на Next.js):**
   - В созданном виртуальном хосте **CentralDispatch**
   - Перейдите: **Script Handler** → нажмите **Add**
   - **Suffixes**: `*` (звездочка - все файлы)
   - **Type**: выберите `Proxy` из выпадающего списка
   - **Handler Name**: `proxy-nodejs`
   - **Replace With**: `http://127.0.0.1:3000$REQUEST_URI`
   - Нажмите **Save**

4. **Сохраните и перезапустите:**
   - Нажмите кнопку **Graceful Restart** в правом верхнем углу
   - Подождите 10-15 секунд

### Шаг 2: Настройка SSL (Let's Encrypt)

После того как виртуальный хост настроен:

1. **Подключитесь к серверу:**
   ```bash
   ssh centraldispatch
   ```

2. **Установите SSL сертификат:**
   ```bash
   certbot certonly --webroot -w /root/centraldispatch/public -d centraldispatch.id -d www.centraldispatch.id --non-interactive --agree-tos --email admin@centraldispatch.id
   ```

   **Если папка public не существует:**
   ```bash
   mkdir -p /root/centraldispatch/public
   certbot certonly --webroot -w /root/centraldispatch/public -d centraldispatch.id -d www.centraldispatch.id --non-interactive --agree-tos --email admin@centraldispatch.id
   ```

3. **Настройте SSL в OpenLiteSpeed:**
   - В админ-панели: **Virtual Hosts** → **CentralDispatch** → **SSL**
   - **Private Key File**: `/etc/letsencrypt/live/centraldispatch.id/privkey.pem`
   - **Certificate File**: `/etc/letsencrypt/live/centraldispatch.id/fullchain.pem`
   - **CA Certificate File**: `/etc/letsencrypt/live/centraldispatch.id/chain.pem`
   - Включите **SSL** (чекбокс)
   - Нажмите **Save**
   - Выполните **Graceful Restart**

### Шаг 3: Проверка

После всех настроек проверьте:

```bash
# HTTP должен работать
curl -I http://centraldispatch.id

# HTTPS должен работать
curl -I https://centraldispatch.id
```

## 📝 Альтернатива: Настройка через конфигурационные файлы

Если веб-интерфейс не работает, можно настроить вручную через файлы (более сложно).

---

**Важно:** После настройки виртуального хоста и SSL, сайт будет доступен по:
- http://centraldispatch.id
- https://centraldispatch.id
- http://www.centraldispatch.id
- https://www.centraldispatch.id























