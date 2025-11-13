# ⚡ Быстрый деплой Next.js (выполнить на сервере)

Выполни эти команды на сервере через SSH:

```bash
# 1. Перейти в директорию проекта
cd /var/www/centraldispatch.id
# или найти где проект:
# find /var/www -name "package.json" -type f 2>/dev/null

# 2. Загрузить NVM
source ~/.nvm/nvm.sh

# 3. Получить последнюю версию (если проект в Git)
git pull origin main

# 4. Установить зависимости
npm install

# 5. Собрать Next.js приложение
npm run build

# 6. Остановить старый сервер
pm2 stop centraldispatch-server 2>/dev/null
pm2 delete centraldispatch-server 2>/dev/null

# 7. Запустить Next.js
pm2 start npm --name "centraldispatch-nextjs" -- start

# 8. Сохранить конфигурацию
pm2 save

# 9. Проверить работу
curl http://localhost:3000
curl http://centraldispatch.id
```

**После этого открой в браузере:** `http://centraldispatch.id`

**Должен открыться твой Next.js проект (HTML страница), а не JSON!**

---

## Если что-то пошло не так:

```bash
# Посмотреть логи
pm2 logs centraldispatch-nextjs --lines 50

# Проверить статус
pm2 status

# Проверить что порт 3000 занят правильным процессом
netstat -tlnp | grep 3000
```

**Подробная инструкция:** [`DEPLOY_NEXTJS.md`](./DEPLOY_NEXTJS.md)






