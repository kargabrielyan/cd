# 🗑️ Удаление OpenLiteSpeed с сервера

**Цель:** Полностью удалить OpenLiteSpeed после успешной миграции на Nginx

---

## ⚠️ ВАЖНО: Перед удалением

**Убедись что:**
- ✅ Nginx установлен и работает
- ✅ Сайт работает через Nginx
- ✅ SSL сертификаты перенесены
- ✅ Все работает стабильно несколько дней
- ✅ Создана резервная копия конфигурации OpenLiteSpeed

**Не удаляй OpenLiteSpeed если:**
- ❌ Nginx еще не настроен
- ❌ Сайт не работает через Nginx
- ❌ Есть проблемы с миграцией

---

## 📋 Полная инструкция по удалению

### Шаг 1: Остановить OpenLiteSpeed

```bash
# 1. Остановить OpenLiteSpeed
systemctl stop lsws 2>/dev/null

# 2. Отключить автозапуск
systemctl disable lsws 2>/dev/null

# 3. Проверить что остановлен
ps aux | grep litespeed | grep -v grep

# 4. Проверить что порты свободны
netstat -tlnp | grep -E ':(7080|8088|80|443)' | grep -v nginx
```

**Ожидаемый результат:**
- OpenLiteSpeed не запущен
- Порты 80 и 443 заняты только Nginx

---

### Шаг 2: Создать резервную копию (на всякий случай)

```bash
# 1. Создать директорию для бэкапа
mkdir -p /root/backup_openlitespeed_final_$(date +%Y%m%d)

# 2. Скопировать конфигурацию
cp -r /usr/local/lsws/conf/ /root/backup_openlitespeed_final_$(date +%Y%m%d)/lsws_conf/ 2>/dev/null

# 3. Скопировать SSL сертификаты (если еще не скопированы)
cp -r /usr/local/lsws/conf/cert/ /root/backup_openlitespeed_final_$(date +%Y%m%d)/ssl_certs/ 2>/dev/null

# 4. Сохранить список установленных пакетов
dpkg -l | grep -i litespeed > /root/backup_openlitespeed_final_$(date +%Y%m%d)/packages.txt 2>/dev/null

# 5. Проверить что бэкап создан
ls -la /root/backup_openlitespeed_final_$(date +%Y%m%d)/
```

---

### Шаг 3: Удалить OpenLiteSpeed

#### Вариант А: Если установлен через пакет (apt)

```bash
# 1. Найти установленные пакеты OpenLiteSpeed
dpkg -l | grep -i litespeed

# 2. Удалить пакеты
apt remove -y openlitespeed lsphp* 2>/dev/null

# 3. Удалить конфигурацию
apt purge -y openlitespeed lsphp* 2>/dev/null

# 4. Очистить зависимости
apt autoremove -y
apt autoclean
```

#### Вариант Б: Если установлен вручную (в /usr/local/lsws)

```bash
# 1. Остановить OpenLiteSpeed
systemctl stop lsws 2>/dev/null
systemctl disable lsws 2>/dev/null

# 2. Удалить директорию OpenLiteSpeed
rm -rf /usr/local/lsws/

# 3. Удалить systemd сервис (если есть)
rm -f /etc/systemd/system/lsws.service
rm -f /lib/systemd/system/lsws.service
rm -f /etc/systemd/system/multi-user.target.wants/lsws.service

# 4. Перезагрузить systemd
systemctl daemon-reload
systemctl reset-failed
```

#### Вариант В: Полное удаление (рекомендуется)

```bash
# 1. Остановить OpenLiteSpeed
systemctl stop lsws 2>/dev/null
systemctl disable lsws 2>/dev/null

# 2. Удалить через apt (если установлен через пакет)
apt remove -y openlitespeed lsphp* 2>/dev/null
apt purge -y openlitespeed lsphp* 2>/dev/null

# 3. Удалить директорию (если установлен вручную)
rm -rf /usr/local/lsws/

# 4. Удалить systemd сервисы
rm -f /etc/systemd/system/lsws.service
rm -f /lib/systemd/system/lsws.service
rm -f /etc/systemd/system/multi-user.target.wants/lsws.service

# 5. Удалить init скрипты (если есть)
rm -f /etc/init.d/lsws
rm -f /etc/rc*.d/*lsws

# 6. Удалить логи (опционально)
rm -rf /usr/local/lsws/logs/ 2>/dev/null

# 7. Перезагрузить systemd
systemctl daemon-reload
systemctl reset-failed

# 8. Очистить пакеты
apt autoremove -y
apt autoclean
```

---

### Шаг 4: Проверка удаления

```bash
# 1. Проверить что OpenLiteSpeed не запущен
ps aux | grep litespeed | grep -v grep

# 2. Проверить что директория удалена
ls -la /usr/local/lsws/ 2>/dev/null || echo "Директория удалена ✓"

# 3. Проверить что systemd сервис удален
systemctl list-unit-files | grep lsws || echo "Сервис удален ✓"

# 4. Проверить что порты свободны (кроме Nginx)
netstat -tlnp | grep -E ':(7080|8088)' || echo "Порты OpenLiteSpeed свободны ✓"

# 5. Проверить что Nginx работает
systemctl is-active nginx
curl http://localhost

# 6. Проверить что сайт работает
curl http://centraldispatch.id
```

**Ожидаемый результат:**
- OpenLiteSpeed полностью удален
- Nginx работает нормально
- Сайт доступен

---

### Шаг 5: Очистка firewall (опционально)

Если OpenLiteSpeed использовал специальные порты, можно закрыть их:

```bash
# 1. Проверить правила firewall
ufw status | grep -E '(7080|8088)'

# 2. Закрыть порты OpenLiteSpeed (если открыты)
ufw deny 7080/tcp 2>/dev/null  # Порт админ-панели
ufw deny 8088/tcp 2>/dev/null  # Альтернативный порт

# 3. Проверить что порты закрыты
ufw status | grep -E '(7080|8088)'
```

---

## 🚀 Быстрое удаление (одной командой)

Если уверен что все работает через Nginx:

```bash
systemctl stop lsws 2>/dev/null && \
systemctl disable lsws 2>/dev/null && \
apt remove -y openlitespeed lsphp* 2>/dev/null && \
apt purge -y openlitespeed lsphp* 2>/dev/null && \
rm -rf /usr/local/lsws/ && \
rm -f /etc/systemd/system/lsws.service && \
rm -f /lib/systemd/system/lsws.service && \
rm -f /etc/systemd/system/multi-user.target.wants/lsws.service && \
systemctl daemon-reload && \
apt autoremove -y && \
echo "OpenLiteSpeed удален. Проверка:" && \
ps aux | grep litespeed | grep -v grep || echo "OpenLiteSpeed не запущен ✓"
```

---

## 🔍 Проверка что все удалено

```bash
# Полная проверка
echo "=== Процессы OpenLiteSpeed ==="
ps aux | grep -i litespeed | grep -v grep || echo "Нет процессов ✓"
echo ""

echo "=== Директории ==="
ls -la /usr/local/lsws/ 2>/dev/null || echo "Директория удалена ✓"
echo ""

echo "=== Systemd сервисы ==="
systemctl list-unit-files | grep lsws || echo "Сервисы удалены ✓"
echo ""

echo "=== Пакеты ==="
dpkg -l | grep -i litespeed || echo "Пакеты удалены ✓"
echo ""

echo "=== Порты ==="
netstat -tlnp | grep -E ':(7080|8088)' || echo "Порты свободны ✓"
echo ""

echo "=== Nginx работает ==="
systemctl is-active nginx && echo "Nginx активен ✓" || echo "Nginx не работает!"
```

---

## ⚠️ Если что-то пошло не так

### Восстановление из бэкапа

```bash
# 1. Найти бэкап
ls -la /root/backup_openlitespeed_*/

# 2. Восстановить конфигурацию (если нужно)
# cp -r /root/backup_openlitespeed_*/lsws_conf/* /usr/local/lsws/conf/

# 3. Переустановить OpenLiteSpeed (если нужно)
# apt install -y openlitespeed
```

---

## 📝 После удаления

Убедись что:

- ✅ Nginx работает: `systemctl is-active nginx`
- ✅ Сайт доступен: `curl http://centraldispatch.id`
- ✅ SSL работает: `curl https://centraldispatch.id`
- ✅ Логи Nginx работают: `tail /var/log/nginx/centraldispatch.id.access.log`

---

## ✅ Чеклист удаления

- [ ] OpenLiteSpeed остановлен
- [ ] Резервная копия создана
- [ ] OpenLiteSpeed удален
- [ ] Systemd сервисы удалены
- [ ] Директории удалены
- [ ] Пакеты удалены
- [ ] Nginx работает
- [ ] Сайт доступен через Nginx
- [ ] Firewall настроен правильно

---

**Важно:** Не удаляй OpenLiteSpeed пока не убедишься что Nginx работает стабильно!


