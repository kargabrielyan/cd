/**
 * PM2 Ecosystem конфигурация - ШАБЛОН
 * 
 * Скопируй этот файл в ecosystem.config.js и заполни реальными значениями
 * 
 * Использование:
 *   cp ecosystem.config.example.js ecosystem.config.js
 *   nano ecosystem.config.js  # заполнить реальными значениями
 *   pm2 start ecosystem.config.js
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      name: "centraldispatch-nextjs",
      script: "npm",
      args: "start",
      cwd: "/var/www/centraldispatch.id",
      instances: 1,
      exec_mode: "fork",
      env: {
        // Режим работы
        NODE_ENV: "production",
        
        // Порт для Next.js сервера
        PORT: 3000,
        
        // Настройки Email (глобальные для всего приложения)
        // ⚠️ ЗАПОЛНИ РЕАЛЬНЫМИ ЗНАЧЕНИЯМИ!
        EMAIL_HOST: "smtp.gmail.com",
        EMAIL_PORT: "587",
        EMAIL_USER: "your-email@gmail.com",  // ⚠️ Замени на реальный Gmail
        EMAIL_PASS: "your-app-password",      // ⚠️ Замени на пароль приложения Gmail
        EMAIL_TO: "gabrielyankaro67@gmail.com",  // ⚠️ Адрес получателя
        
        // URL API (для продакшена)
        NEXT_PUBLIC_API_URL: "http://centraldispatch.id",
        
        // Basic Auth (опционально)
        ENABLE_BASIC_AUTH: "false",
        BASIC_AUTH_USER: "tester",
        BASIC_AUTH_PASS: "test123",
      },
      // Автоматический перезапуск при сбоях
      autorestart: true,
      // Максимальное количество перезапусков
      max_restarts: 10,
      // Минимальное время между перезапусками (мс)
      min_uptime: "10s",
      // Максимальное время между перезапусками (мс)
      max_memory_restart: "1G",
      // Логи
      error_file: "./logs/centraldispatch-error.log",
      out_file: "./logs/centraldispatch-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};


















