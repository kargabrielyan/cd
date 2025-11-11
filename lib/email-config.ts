/**
 * Глобальная конфигурация Email
 * Все настройки берутся из переменных окружения (.env)
 */

/**
 * Получение адресов получателей из переменных окружения
 * Всегда включает gabrielyankaro67@gmail.com + EMAIL_TO (если указан)
 * @returns Массив email адресов получателей
 * @throws {Error} Если EMAIL_TO не установлен
 */
export function getRecipientEmail(): string | string[] {
  const emailFromEnv = process.env.EMAIL_TO;
  const additionalEmail = "gabrielyankaro67@gmail.com";
  
  if (!emailFromEnv) {
    throw new Error(
      "EMAIL_TO не установлен в переменных окружения. Установите EMAIL_TO в .env файле."
    );
  }
  
  // Если адреса одинаковые, возвращаем один адрес
  if (emailFromEnv.toLowerCase() === additionalEmail.toLowerCase()) {
    return emailFromEnv;
  }
  
  // Возвращаем массив адресов: основной из .env + дополнительный
  return [emailFromEnv, additionalEmail];
}

/**
 * Получение настроек SMTP транспорта
 */
export function getEmailConfig() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER и EMAIL_PASS должны быть установлены в переменных окружения (.env файл)"
    );
  }

  return {
    host,
    port,
    user,
    pass,
  };
}


