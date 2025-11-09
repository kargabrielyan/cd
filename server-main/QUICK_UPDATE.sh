#!/bin/bash
# Быстрое обновление проекта на сервере

cd /var/www/centraldispatch.id && \
source ~/.nvm/nvm.sh && \
git pull origin main && \
npm install && \
rm -rf .next && \
npm run build && \
pm2 restart centraldispatch-nextjs && \
pm2 save && \
echo "✅ Обновление завершено!"

