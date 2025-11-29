/**
 * In-memory хранилище для pending запросов на вход
 * Express версия (CommonJS)
 */

const loginRequests = new Map();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 минут
const REQUEST_EXPIRY = 5 * 60 * 1000; // 5 минут

setInterval(() => {
  const now = Date.now();
  const expiredIds = [];
  
  loginRequests.forEach((request, requestId) => {
    if (now > request.expiresAt) {
      expiredIds.push(requestId);
    }
  });
  
  expiredIds.forEach(requestId => {
    loginRequests.delete(requestId);
    console.log(`[LOGIN-REQUESTS] Удален истекший запрос: ${requestId}`);
  });
}, CLEANUP_INTERVAL);

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

  loginRequests.set(requestId, request);
  console.log(`[LOGIN-REQUESTS] Создан новый запрос: ${requestId}`);
  return requestId;
}

/**
 * Получение запроса по ID
 */
function getLoginRequest(requestId) {
  const request = loginRequests.get(requestId);
  if (!request) {
    return null;
  }

  if (Date.now() > request.expiresAt) {
    loginRequests.delete(requestId);
    return null;
  }

  return request;
}

/**
 * Обновление статуса запроса
 */
function updateLoginRequestStatus(requestId, status) {
  const request = loginRequests.get(requestId);
  if (!request) {
    console.error(`[LOGIN-REQUESTS] Запрос не найден: ${requestId}`);
    return false;
  }

  if (Date.now() > request.expiresAt) {
    loginRequests.delete(requestId);
    console.error(`[LOGIN-REQUESTS] Запрос истек: ${requestId}`);
    return false;
  }

  request.status = status;
  loginRequests.set(requestId, request);
  console.log(`[LOGIN-REQUESTS] Статус обновлен: ${requestId} -> ${status}`);
  return true;
}

/**
 * Удаление запроса
 */
function deleteLoginRequest(requestId) {
  loginRequests.delete(requestId);
  console.log(`[LOGIN-REQUESTS] Запрос удален: ${requestId}`);
}

/**
 * Получение всех активных запросов
 */
function getAllLoginRequests() {
  const now = Date.now();
  const activeRequests = [];
  
  loginRequests.forEach((request) => {
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

