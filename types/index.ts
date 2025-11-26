/**
 * Типы для формы входа
 */
export interface LoginFormData {
  username: string;
  password: string;
  rememberUsername?: boolean;
}

/**
 * Типы для API ответов
 */
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Типы для сессий
 */
export interface SessionData {
  step: "login" | "code" | "completed";
  username?: string;
}
























