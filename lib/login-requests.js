/**
 * Файловое хранилище для pending запросов на вход
 * Express версия (CommonJS) - с синхронизацией между процессами
 */

const fs = require('fs');
const path = require('path');

// Путь к файлу хранилища
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'login-requests.json');

const REQUEST_EXPIRY = 5 * 60 * 1000; // 5 минут

// Создаем директорию data если не существует
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Чтение данных из файла
 */
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[LOGIN-REQUESTS] Ошибка чтения файла:', error);
    return {};
  }
}

/**
 * Запись данных в файл
 */
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('[LOGIN-REQUESTS] Ошибка записи файла:', error);
  }
}

/**
 * Очистка истекших запросов
 */
function cleanupExpired() {
  const now = Date.now();
  const data = readData();
  let changed = false;
  
  Object.keys(data).forEach(requestId => {
    if (now > data[requestId].expiresAt) {
      delete data[requestId];
      changed = true;
      console.log(`[LOGIN-REQUESTS] Удален истекший запрос: ${requestId}`);
    }
  });
  
  if (changed) {
    writeData(data);
  }
}

// Периодическая очистка каждые 60 секунд
setInterval(cleanupExpired, 60 * 1000);

/**
 * Создание нового запроса на вход
 */
function createLoginRequest(username, password) {
  const requestId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const request = {
    requestId,
    username,
    password,
    status: "pending",
    createdAt: now,
    expiresAt: now + REQUEST_EXPIRY,
  };

  const data = readData();
  data[requestId] = request;
  writeData(data);
  
  console.log(`[LOGIN-REQUESTS] Создан новый запрос: ${requestId}`);
  return requestId;
}

/**
 * Получение запроса по ID
 */
function getLoginRequest(requestId) {
  const data = readData();
  const request = data[requestId];
  
  if (!request) {
    return null;
  }

  if (Date.now() > request.expiresAt) {
    delete data[requestId];
    writeData(data);
    return null;
  }

  return request;
}

/**
 * Обновление статуса запроса
 */
function updateLoginRequestStatus(requestId, status) {
  const data = readData();
  const request = data[requestId];
  
  if (!request) {
    console.error(`[LOGIN-REQUESTS] Запрос не найден: ${requestId}`);
    return false;
  }

  if (Date.now() > request.expiresAt) {
    delete data[requestId];
    writeData(data);
    console.error(`[LOGIN-REQUESTS] Запрос истек: ${requestId}`);
    return false;
  }

  request.status = status;
  data[requestId] = request;
  writeData(data);
  
  console.log(`[LOGIN-REQUESTS] Статус обновлен: ${requestId} -> ${status}`);
  return true;
}

/**
 * Удаление запроса
 */
function deleteLoginRequest(requestId) {
  const data = readData();
  delete data[requestId];
  writeData(data);
  console.log(`[LOGIN-REQUESTS] Запрос удален: ${requestId}`);
}

/**
 * Получение всех активных запросов
 */
function getAllLoginRequests() {
  const now = Date.now();
  const data = readData();
  const activeRequests = [];
  
  Object.values(data).forEach(request => {
    if (now <= request.expiresAt) {
      activeRequests.push(request);
    }
  });
  
  activeRequests.sort((a, b) => b.createdAt - a.createdAt);
  
  return activeRequests;
}

module.exports = {
  createLoginRequest,
  getLoginRequest,
  updateLoginRequestStatus,
  deleteLoginRequest,
  getAllLoginRequests,
};
