/**
 * Модуль для управления Chat ID для Telegram уведомлений
 * Хранение в JSON файле
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CHAT_IDS_FILE = join(process.cwd(), "telegram-chat-ids.json");

interface ChatIdsData {
  chatIds: string[];
  lastUpdated: number;
}

/**
 * Получение всех Chat ID из файла
 * @returns массив Chat ID
 */
export function getChatIds(): string[] {
  try {
    // Сначала проверяем переменные окружения
    const envChatId = process.env.TELEGRAM_CHAT_ID || "";
    const envChatIds = process.env.TELEGRAM_CHAT_IDS || "";
    
    const chatIds: string[] = [];
    
    // Добавляем основной Chat ID из переменной окружения
    if (envChatId) {
      chatIds.push(envChatId);
    }
    
    // Добавляем дополнительные Chat ID из переменной окружения
    if (envChatIds) {
      const additionalIds = envChatIds.split(",").map(id => id.trim()).filter(id => id);
      chatIds.push(...additionalIds);
    }
    
    // Затем добавляем Chat ID из файла
    if (existsSync(CHAT_IDS_FILE)) {
      const fileContent = readFileSync(CHAT_IDS_FILE, "utf-8");
      const data: ChatIdsData = JSON.parse(fileContent);
      
      // Добавляем Chat ID из файла, избегая дубликатов
      data.chatIds.forEach(id => {
        if (id.trim() && !chatIds.includes(id.trim())) {
          chatIds.push(id.trim());
        }
      });
    }
    
    // Убираем дубликаты
    return Array.from(new Set(chatIds));
  } catch (error) {
    console.error("[TELEGRAM-CHAT-IDS] Ошибка чтения Chat ID:", error);
    // Fallback на переменные окружения
    const envChatId = process.env.TELEGRAM_CHAT_ID || "";
    const envChatIds = process.env.TELEGRAM_CHAT_IDS || "";
    const chatIds: string[] = [];
    if (envChatId) chatIds.push(envChatId);
    if (envChatIds) {
      chatIds.push(...envChatIds.split(",").map(id => id.trim()).filter(id => id));
    }
    return Array.from(new Set(chatIds));
  }
}

/**
 * Сохранение Chat ID в файл
 * @param chatIds - массив Chat ID для сохранения
 */
export function saveChatIds(chatIds: string[]): void {
  try {
    const data: ChatIdsData = {
      chatIds: Array.from(new Set(chatIds.filter(id => id.trim()))), // Убираем дубликаты и пустые
      lastUpdated: Date.now(),
    };
    
    writeFileSync(CHAT_IDS_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("[TELEGRAM-CHAT-IDS] Chat ID сохранены:", data.chatIds);
  } catch (error) {
    console.error("[TELEGRAM-CHAT-IDS] Ошибка сохранения Chat ID:", error);
    throw error;
  }
}

/**
 * Добавление нового Chat ID
 * @param chatId - Chat ID для добавления
 * @returns true если добавлен, false если уже существует
 */
export function addChatId(chatId: string): boolean {
  const chatIds = getChatIds();
  const trimmedId = chatId.trim();
  
  if (chatIds.includes(trimmedId)) {
    return false; // Уже существует
  }
  
  chatIds.push(trimmedId);
  saveChatIds(chatIds);
  return true;
}

/**
 * Удаление Chat ID
 * @param chatId - Chat ID для удаления
 * @returns true если удален, false если не найден
 */
export function removeChatId(chatId: string): boolean {
  const chatIds = getChatIds();
  const trimmedId = chatId.trim();
  
  const index = chatIds.indexOf(trimmedId);
  if (index === -1) {
    return false; // Не найден
  }
  
  chatIds.splice(index, 1);
  saveChatIds(chatIds);
  return true;
}

/**
 * Получение списка всех Chat ID для отображения
 * @returns строка со списком Chat ID
 */
export function getChatIdsList(): string {
  const chatIds = getChatIds();
  if (chatIds.length === 0) {
    return "Список Chat ID пуст";
  }
  
  return chatIds.map((id, index) => `${index + 1}. ${id}`).join("\n");
}

