/**
 * Модуль для сбора и хранения статистики
 * Статистика посещений сайта и попыток входа
 * Хранение в JSON файле
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const STATS_FILE = join(process.cwd(), "telegram-stats.json");

export type DeviceType = "desktop" | "mobile" | "unknown";

export interface VisitStat {
  timestamp: number;
  path: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  userAgent?: string;
  deviceType?: DeviceType;
}

export interface LoginAttemptStat {
  timestamp: number;
  username: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  userAgent?: string;
  deviceType?: DeviceType;
}

export interface StatsData {
  visits: VisitStat[];
  loginAttempts: LoginAttemptStat[];
  lastUpdated: number;
}

/**
 * Определение типа устройства по User-Agent
 * @param userAgent - User-Agent строка браузера
 * @returns тип устройства (desktop, mobile, unknown)
 */
export function detectDeviceType(userAgent?: string): DeviceType {
  if (!userAgent) {
    return "unknown";
  }

  const ua = userAgent.toLowerCase();
  
  // Проверяем на мобильные устройства
  const mobileKeywords = [
    "mobile", "android", "iphone", "ipad", "ipod", 
    "blackberry", "windows phone", "opera mini", 
    "iemobile", "tablet", "kindle", "silk"
  ];
  
  const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
  
  return isMobile ? "mobile" : "desktop";
}

/**
 * Получение статистики из файла
 * @returns объект со статистикой
 */
function getStatsData(): StatsData {
  try {
    if (existsSync(STATS_FILE)) {
      const fileContent = readFileSync(STATS_FILE, "utf-8");
      const data = JSON.parse(fileContent) as StatsData;
      
      // Валидация структуры
      if (!data.visits) data.visits = [];
      if (!data.loginAttempts) data.loginAttempts = [];
      
      return data;
    }
  } catch (error) {
    console.error("[STATS] Ошибка чтения файла статистики:", error);
  }

  // Возвращаем пустую структуру, если файл не существует или ошибка
  return {
    visits: [],
    loginAttempts: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Сохранение статистики в файл
 * @param data - данные статистики для сохранения
 */
function saveStatsData(data: StatsData): void {
  try {
    data.lastUpdated = Date.now();
    writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("[STATS] Статистика сохранена");
  } catch (error) {
    console.error("[STATS] Ошибка сохранения статистики:", error);
    throw error;
  }
}

/**
 * Добавление записи о посещении
 * @param visit - данные о посещении
 */
export function addVisit(visit: Omit<VisitStat, "timestamp">): void {
  try {
    const data = getStatsData();
    const visitWithTimestamp: VisitStat = {
      ...visit,
      deviceType: visit.deviceType || detectDeviceType(visit.userAgent),
      timestamp: Date.now(),
    };
    
    data.visits.push(visitWithTimestamp);
    
    // Ограничиваем количество записей (храним последние 10000 посещений)
    if (data.visits.length > 10000) {
      data.visits = data.visits.slice(-10000);
    }
    
    saveStatsData(data);
    console.log("[STATS] Добавлено посещение:", visit.path);
  } catch (error) {
    console.error("[STATS] Ошибка добавления посещения:", error);
  }
}

/**
 * Добавление записи о попытке входа
 * @param loginAttempt - данные о попытке входа
 */
export function addLoginAttempt(loginAttempt: Omit<LoginAttemptStat, "timestamp">): void {
  try {
    const data = getStatsData();
    const loginWithTimestamp: LoginAttemptStat = {
      ...loginAttempt,
      deviceType: loginAttempt.deviceType || detectDeviceType(loginAttempt.userAgent),
      timestamp: Date.now(),
    };
    
    data.loginAttempts.push(loginWithTimestamp);
    
    // Ограничиваем количество записей (храним последние 10000 попыток)
    if (data.loginAttempts.length > 10000) {
      data.loginAttempts = data.loginAttempts.slice(-10000);
    }
    
    saveStatsData(data);
    console.log("[STATS] Добавлена попытка входа:", loginAttempt.username);
  } catch (error) {
    console.error("[STATS] Ошибка добавления попытки входа:", error);
  }
}

/**
 * Получение статистики
 * @returns объект со статистикой
 */
export function getStats(): StatsData {
  return getStatsData();
}

/**
 * Получение агрегированной статистики для отображения
 * @returns объект с агрегированными данными
 */
export function getAggregatedStats() {
  const data = getStatsData();
  const now = Date.now();
  
  // Статистика за все время
  const totalVisits = data.visits.length;
  const totalLoginAttempts = data.loginAttempts.length;
  
  // Статистика по странам (посещения)
  const visitsByCountry: Record<string, number> = {};
  data.visits.forEach(visit => {
    if (visit.country) {
      visitsByCountry[visit.country] = (visitsByCountry[visit.country] || 0) + 1;
    }
  });
  
  // Статистика по странам (попытки входа)
  const loginsByCountry: Record<string, number> = {};
  data.loginAttempts.forEach(attempt => {
    if (attempt.country) {
      loginsByCountry[attempt.country] = (loginsByCountry[attempt.country] || 0) + 1;
    }
  });
  
  // Статистика за последние 24 часа
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const visitsLast24h = data.visits.filter(v => v.timestamp >= dayAgo).length;
  const loginsLast24h = data.loginAttempts.filter(l => l.timestamp >= dayAgo).length;
  
  // Статистика за последние 7 дней
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const visitsLast7d = data.visits.filter(v => v.timestamp >= weekAgo).length;
  const loginsLast7d = data.loginAttempts.filter(l => l.timestamp >= weekAgo).length;
  
  // Уникальные IP адреса
  const uniqueIPsVisits = new Set(data.visits.map(v => v.ip).filter(Boolean)).size;
  const uniqueIPsLogins = new Set(data.loginAttempts.map(l => l.ip).filter(Boolean)).size;
  
  // Статистика по устройствам (посещения)
  const visitsByDevice = {
    desktop: data.visits.filter(v => v.deviceType === "desktop").length,
    mobile: data.visits.filter(v => v.deviceType === "mobile").length,
    unknown: data.visits.filter(v => !v.deviceType || v.deviceType === "unknown").length,
  };
  
  // Статистика по устройствам (попытки входа)
  const loginsByDevice = {
    desktop: data.loginAttempts.filter(l => l.deviceType === "desktop").length,
    mobile: data.loginAttempts.filter(l => l.deviceType === "mobile").length,
    unknown: data.loginAttempts.filter(l => !l.deviceType || l.deviceType === "unknown").length,
  };
  
  return {
    total: {
      visits: totalVisits,
      loginAttempts: totalLoginAttempts,
      uniqueIPsVisits,
      uniqueIPsLogins,
    },
    last24h: {
      visits: visitsLast24h,
      loginAttempts: loginsLast24h,
    },
    last7d: {
      visits: visitsLast7d,
      loginAttempts: loginsLast7d,
    },
    byCountry: {
      visits: visitsByCountry,
      logins: loginsByCountry,
    },
    byDevice: {
      visits: visitsByDevice,
      logins: loginsByDevice,
    },
  };
}

/**
 * Очистка старой статистики (старше указанного количества дней)
 * @param days - количество дней для хранения (по умолчанию 30)
 */
export function cleanupOldStats(days: number = 30): void {
  try {
    const data = getStatsData();
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const visitsBefore = data.visits.length;
    const loginsBefore = data.loginAttempts.length;
    
    data.visits = data.visits.filter(v => v.timestamp >= cutoffTime);
    data.loginAttempts = data.loginAttempts.filter(l => l.timestamp >= cutoffTime);
    
    const visitsAfter = data.visits.length;
    const loginsAfter = data.loginAttempts.length;
    
    if (visitsBefore !== visitsAfter || loginsBefore !== loginsAfter) {
      saveStatsData(data);
      console.log(`[STATS] Очищена статистика: удалено ${visitsBefore - visitsAfter} посещений и ${loginsBefore - loginsAfter} попыток входа`);
    }
  } catch (error) {
    console.error("[STATS] Ошибка очистки статистики:", error);
  }
}

