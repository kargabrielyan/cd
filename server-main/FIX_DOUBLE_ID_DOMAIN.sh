#!/bin/bash

# 🔧 Скрипт для исправления домена centraldispatch.id.id → centraldispatch.id
# Автор: AI Assistant
# Дата: 2025-01-XX

set -e  # Остановить при ошибке

echo "=========================================="
echo "🔍 Диагностика: Поиск домена centraldispatch.id.id"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Поиск всех вхождений
echo -e "${YELLOW}Шаг 1: Поиск всех вхождений centraldispatch.id.id${NC}"
echo ""

FOUND_FILES=$(sudo grep -R --line-number "centraldispatch.id.id" /etc/nginx 2>/dev/null || true)

if [ -z "$FOUND_FILES" ]; then
    echo -e "${GREEN}✅ Не найдено вхождений centraldispatch.id.id${NC}"
    exit 0
fi

echo -e "${RED}Найдены следующие вхождения:${NC}"
echo "$FOUND_FILES"
echo ""

# 2. Создание резервных копий
echo -e "${YELLOW}Шаг 2: Создание резервных копий${NC}"
BACKUP_DIR="/root/nginx_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Найти все уникальные файлы с проблемным доменом
PROBLEM_FILES=$(echo "$FOUND_FILES" | cut -d: -f1 | sort -u)

for file in $PROBLEM_FILES; do
    if [ -f "$file" ]; then
        echo "Создаю резервную копию: $file"
        sudo cp "$file" "$BACKUP_DIR/$(basename $file).backup"
    fi
done

echo -e "${GREEN}✅ Резервные копии созданы в: $BACKUP_DIR${NC}"
echo ""

# 3. Удаление проблемного файла и симлинка
echo -e "${YELLOW}Шаг 3: Удаление проблемных файлов${NC}"

if [ -f "/etc/nginx/sites-available/centraldispatch.id.id" ]; then
    echo "Удаляю: /etc/nginx/sites-available/centraldispatch.id.id"
    sudo rm -f /etc/nginx/sites-available/centraldispatch.id.id
fi

if [ -L "/etc/nginx/sites-enabled/centraldispatch.id.id" ]; then
    echo "Удаляю симлинк: /etc/nginx/sites-enabled/centraldispatch.id.id"
    sudo rm -f /etc/nginx/sites-enabled/centraldispatch.id.id
fi

echo -e "${GREEN}✅ Проблемные файлы удалены${NC}"
echo ""

# 4. Исправление основного vhost файла
echo -e "${YELLOW}Шаг 4: Исправление основного vhost файла${NC}"

MAIN_VHOST="/etc/nginx/sites-available/centraldispatch.conf"

if [ -f "$MAIN_VHOST" ]; then
    echo "Исправляю: $MAIN_VHOST"
    sudo sed -i 's/centraldispatch\.id\.id/centraldispatch.id/g' "$MAIN_VHOST"
    sudo sed -i 's/www\.centraldispatch\.id\.id/www.centraldispatch.id/g' "$MAIN_VHOST"
    echo -e "${GREEN}✅ Файл исправлен${NC}"
else
    echo -e "${YELLOW}⚠️  Файл $MAIN_VHOST не найден${NC}"
fi

# Также проверим другие возможные файлы
for file in /etc/nginx/sites-available/centraldispatch.id*; do
    if [ -f "$file" ] && [ "$file" != "/etc/nginx/sites-available/centraldispatch.id.id" ]; then
        echo "Исправляю: $file"
        sudo sed -i 's/centraldispatch\.id\.id/centraldispatch.id/g' "$file"
        sudo sed -i 's/www\.centraldispatch\.id\.id/www.centraldispatch.id/g' "$file"
    fi
done

echo ""

# 5. Проверка конфигурации
echo -e "${YELLOW}Шаг 5: Проверка конфигурации Nginx${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Конфигурация Nginx корректна${NC}"
else
    echo -e "${RED}❌ Ошибка в конфигурации Nginx!${NC}"
    exit 1
fi
echo ""

# 6. Перезагрузка Nginx
echo -e "${YELLOW}Шаг 6: Перезагрузка Nginx${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ Nginx успешно перезагружен${NC}"
else
    echo -e "${RED}❌ Ошибка при перезагрузке Nginx!${NC}"
    exit 1
fi
echo ""

# 7. Проверка DNS
echo -e "${YELLOW}Шаг 7: Проверка DNS${NC}"
DNS_RESULT=$(dig +short centraldispatch.id | head -1)
if [ -n "$DNS_RESULT" ]; then
    echo -e "${GREEN}✅ DNS запись найдена: $DNS_RESULT${NC}"
else
    echo -e "${YELLOW}⚠️  DNS запись не найдена или не настроена${NC}"
fi
echo ""

# 8. Финальная проверка
echo -e "${YELLOW}Шаг 8: Финальная проверка${NC}"
FINAL_CHECK=$(sudo grep -R "centraldispatch.id.id" /etc/nginx 2>/dev/null || true)
if [ -z "$FINAL_CHECK" ]; then
    echo -e "${GREEN}✅ Все вхождения centraldispatch.id.id исправлены!${NC}"
else
    echo -e "${RED}⚠️  Остались вхождения:${NC}"
    echo "$FINAL_CHECK"
fi
echo ""

# 9. Показ правильной конфигурации
echo -e "${YELLOW}Шаг 9: Проверка правильной конфигурации${NC}"
CORRECT_CONFIG=$(sudo grep -R "server_name.*centraldispatch.id" /etc/nginx/sites-available/ 2>/dev/null | grep -v "centraldispatch.id.id" || true)
if [ -n "$CORRECT_CONFIG" ]; then
    echo -e "${GREEN}Найдены правильные конфигурации:${NC}"
    echo "$CORRECT_CONFIG"
else
    echo -e "${YELLOW}⚠️  Не найдено правильных конфигураций${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Скрипт завершен!${NC}"
echo "=========================================="
echo ""
echo "📝 Следующие шаги:"
echo "1. Проверь конфигурацию: sudo nginx -t"
echo "2. Проверь статус: sudo systemctl status nginx"
echo "3. Запусти Certbot: sudo certbot --nginx -d centraldispatch.id -d www.centraldispatch.id --dry-run"
echo "4. Если dry-run успешен, запусти без --dry-run"
echo ""
echo "💾 Резервные копии сохранены в: $BACKUP_DIR"

