/**
 * In-memory хранилище для pending запросов на вход
 * В production лучше использовать Redis или базу данных
 */

export type LoginRequestStatus = "pending" | "approved" | "rejected";

export interface LoginRequest {
  requestId: string;
  username: string;
  password: string;
  status: LoginRequestStatus;
  createdAt: number;
  expiresAt: number;
}

// In-memory хранилище
const loginRequests = new Map<string, LoginRequest>();

// Очистка старых запросов (старше 5 минут)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 минут
const REQUEST_EXPIRY = 5 * 60 * 1000; // 5 минут

setInterval(() => {
  const now = Date.now();
  const expiredIds: string[] = [];
  
  // Собираем ID истекших запросов
  loginRequests.forEach((request, requestId) => {
    if (now > request.expiresAt) {
      expiredIds.push(requestId);
    }
  });
  
  // Удаляем истекшие запросы
  expiredIds.forEach(requestId => {
    loginRequests.delete(requestId);
    console.log(`[LOGIN-REQUESTS] Удален истекший запрос: ${requestId}`);
  });
}, CLEANUP_INTERVAL);

/**
 * Создание нового запроса на вход
 * @param username - имя пользователя
 * @param password - пароль
 * @returns requestId
 */
export function createLoginRequest(
  username: string,
  password: string
): string {
  const requestId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const request: LoginRequest = {
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
 * @param requestId - ID запроса
 * @returns запрос или null
 */
export function getLoginRequest(requestId: string): LoginRequest | null {
  const request = loginRequests.get(requestId);
  if (!request) {
    return null;
  }

  // Проверка на истечение
  if (Date.now() > request.expiresAt) {
    loginRequests.delete(requestId);
    return null;
  }

  return request;
}

/**
 * Обновление статуса запроса
 * @param requestId - ID запроса
 * @param status - новый статус
 * @returns true если успешно, false если запрос не найден
 */
export function updateLoginRequestStatus(
  requestId: string,
  status: "approved" | "rejected"
): boolean {
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
 * @param requestId - ID запроса
 */
export function deleteLoginRequest(requestId: string): void {
  loginRequests.delete(requestId);
  console.log(`[LOGIN-REQUESTS] Запрос удален: ${requestId}`);
}

