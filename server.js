/**
 * CentralDispatch - Express Server
 * Миграция с Next.js на Express + EJS
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

// Получение IP адреса клиента
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                 req.headers['x-real-ip'] ||
                 req.headers['cf-connecting-ip'] ||
                 req.connection.remoteAddress ||
                 'unknown';
  req.userAgent = req.headers['user-agent'] || 'unknown';
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);
app.use('/', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[SERVER] Ошибка:', err);
  console.error('[SERVER] Stack:', err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущен на порту ${PORT}`);
  console.log(`[SERVER] Режим: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

