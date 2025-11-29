# План развертывания CentralDispatch на сервер 91.99.62.116

## Цель
Развернуть Express приложение CentralDispatch на сервере 91.99.62.116 с доменом https://centralldispatch.id/

## Вариант: Развертывание через Git

## Этапы развертывания

### Этап 1: Подготовка локального репозитория
1. Закоммитить все изменения Express версии
2. Запушить изменения в GitHub
3. Проверить, что все необходимые файлы включены

### Этап 2: Подготовка сервера
1. Подключиться к серверу через SSH
2. Проверить наличие Node.js (версия >= 18.0.0)
3. Установить Node.js, если отсутствует
4. Установить PM2 глобально
5. Установить Git, если отсутствует
6. Проверить наличие веб-сервера (OpenLiteSpeed/Nginx)

### Этап 3: Клонирование репозитория на сервер
1. Создать директорию для проекта: `/var/www/centralldispatch.id` или `/root/centraldispatch`
2. Клонировать репозиторий с GitHub
3. Перейти в директорию проекта

### Этап 4: Настройка окружения
1. Установить зависимости: `npm install --production`
2. Создать файл `.env` с production переменными
3. Создать директорию для логов: `mkdir -p logs`
4. Настроить права доступа

### Этап 5: Настройка веб-сервера
1. Определить тип веб-сервера (OpenLiteSpeed/Nginx)
2. Настроить виртуальный хост для домена centralldispatch.id
3. Настроить reverse proxy на порт 3000
4. Настроить SSL сертификат (Let's Encrypt)

### Этап 6: Запуск приложения
1. Запустить приложение через PM2
2. Настроить автозапуск PM2 при перезагрузке
3. Проверить статус приложения

### Этап 7: Проверка и тестирование
1. Проверить доступность сайта по HTTP
2. Проверить доступность сайта по HTTPS
3. Протестировать основные функции (логин, верификация)

## Команды для выполнения

### На локальной машине:
```bash
# 1. Добавить все новые файлы
git add .

# 2. Закоммитить изменения
git commit -m "Migrate to Express + EJS version"

# 3. Запушить в GitHub
git push origin main
```

### На сервере (через SSH):
```bash
# Проверка окружения
node --version
npm --version
pm2 --version
git --version

# Установка Node.js (если нужно)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Установка PM2 (если нужно)
npm install -g pm2

# Создание директории и клонирование
mkdir -p /var/www/centralldispatch.id
cd /var/www/centralldispatch.id
git clone https://github.com/kargabrielyan/cd.git .

# Установка зависимостей
npm install --production

# Создание .env файла
nano .env

# Создание директории для логов
mkdir -p logs

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Переменные окружения для .env
```
NODE_ENV=production
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ustrucking966@gmail.com
EMAIL_PASS=vwhj wwmt ktkw acya
EMAIL_TO=gabrielyankaro67@gmail.com
TELEGRAM_BOT_TOKEN=8569212803:AAGDp_ETyyHqs_V_h2WChU184I_mGOkrJDs
TELEGRAM_CHAT_ID=5257327001
TELEGRAM_CHAT_IDS=7398140242,972122534
SESSION_SECRET=<сгенерировать случайный секретный ключ>
```

## Возможные риски
1. Конфликт версий Node.js
2. Проблемы с правами доступа к файлам
3. Конфликт портов (3000 может быть занят)
4. Проблемы с SSL сертификатом
5. Проблемы с настройкой веб-сервера

## Примечания
- Домен указан как `centralldispatch.id`, но в старых конфигах был `centraldispatch.id` - нужно уточнить
- ecosystem.config.js содержит реальные пароли и должен быть в .gitignore
- Нужно создать ecosystem.config.example.js для примера

