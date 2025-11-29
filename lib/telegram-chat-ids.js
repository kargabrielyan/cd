/**
 * Модуль для управления Chat ID для Telegram уведомлений
 * Express версия (CommonJS)
 */

const fs = require('fs');
const path = require('path');

const CHAT_IDS_FILE = path.join(process.cwd(), "telegram-chat-ids.json");

/**
 * Получение всех Chat ID
 */
function getChatIds() {
  try {
    const envChatId = process.env.TELEGRAM_CHAT_ID || "";
    const envChatIds = process.env.TELEGRAM_CHAT_IDS || "";
    
    const chatIds = [];
    
    if (envChatId) {
      chatIds.push(envChatId);
    }
    
    if (envChatIds) {
      const additionalIds = envChatIds.split(",").map(id => id.trim()).filter(id => id);
      chatIds.push(...additionalIds);
    }
    
    if (fs.existsSync(CHAT_IDS_FILE)) {
      const fileContent = fs.readFileSync(CHAT_IDS_FILE, "utf-8");
      const data = JSON.parse(fileContent);
      
      data.chatIds.forEach(id => {
        if (id.trim() && !chatIds.includes(id.trim())) {
          chatIds.push(id.trim());
        }
      });
    }
    
    return Array.from(new Set(chatIds));
  } catch (error) {
    console.error("[TELEGRAM-CHAT-IDS] Ошибка чтения Chat ID:", error);
    const envChatId = process.env.TELEGRAM_CHAT_ID || "";
    const envChatIds = process.env.TELEGRAM_CHAT_IDS || "";
    const chatIds = [];
    if (envChatId) chatIds.push(envChatId);
    if (envChatIds) {
      chatIds.push(...envChatIds.split(",").map(id => id.trim()).filter(id => id));
    }
    return Array.from(new Set(chatIds));
  }
}

/**
 * Сохранение Chat ID в файл
 */
function saveChatIds(chatIds) {
  try {
    const data = {
      chatIds: Array.from(new Set(chatIds.filter(id => id.trim()))),
      lastUpdated: Date.now(),
    };
    
    fs.writeFileSync(CHAT_IDS_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("[TELEGRAM-CHAT-IDS] Chat ID сохранены:", data.chatIds);
  } catch (error) {
    console.error("[TELEGRAM-CHAT-IDS] Ошибка сохранения Chat ID:", error);
    throw error;
  }
}

/**
 * Добавление нового Chat ID
 */
function addChatId(chatId) {
  const chatIds = getChatIds();
  const trimmedId = chatId.trim();
  
  if (chatIds.includes(trimmedId)) {
    return false;
  }
  
  chatIds.push(trimmedId);
  saveChatIds(chatIds);
  return true;
}

/**
 * Удаление Chat ID
 */
function removeChatId(chatId) {
  const chatIds = getChatIds();
  const trimmedId = chatId.trim();
  
  const index = chatIds.indexOf(trimmedId);
  if (index === -1) {
    return false;
  }
  
  chatIds.splice(index, 1);
  saveChatIds(chatIds);
  return true;
}

/**
 * Получение списка всех Chat ID для отображения
 */
function getChatIdsList() {
  const chatIds = getChatIds();
  if (chatIds.length === 0) {
    return "Список Chat ID пуст";
  }
  
  return chatIds.map((id, index) => `${index + 1}. ${id}`).join("\n");
}

module.exports = {
  getChatIds,
  saveChatIds,
  addChatId,
  removeChatId,
  getChatIdsList,
};

