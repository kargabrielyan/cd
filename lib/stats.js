/**
 * Модуль для сбора и хранения статистики
 * Express версия (CommonJS)
 */

const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(process.cwd(), "telegram-stats.json");

function detectDeviceType(userAgent) {
  if (!userAgent) {
    return "unknown";
  }

  const ua = userAgent.toLowerCase();
  
  const mobileKeywords = [
    "mobile", "android", "iphone", "ipad", "ipod", 
    "blackberry", "windows phone", "opera mini", 
    "iemobile", "tablet", "kindle", "silk"
  ];
  
  const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
  
  return isMobile ? "mobile" : "desktop";
}

function getStatsData() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const fileContent = fs.readFileSync(STATS_FILE, "utf-8");
      const data = JSON.parse(fileContent);
      
      if (!data.visits) data.visits = [];
      if (!data.loginAttempts) data.loginAttempts = [];
      
      return data;
    }
  } catch (error) {
    console.error("[STATS] Ошибка чтения файла статистики:", error);
  }

  return {
    visits: [],
    loginAttempts: [],
    lastUpdated: Date.now(),
  };
}

function saveStatsData(data) {
  try {
    data.lastUpdated = Date.now();
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("[STATS] Статистика сохранена");
  } catch (error) {
    console.error("[STATS] Ошибка сохранения статистики:", error);
    throw error;
  }
}

function addVisit(visit) {
  try {
    const data = getStatsData();
    const visitWithTimestamp = {
      ...visit,
      deviceType: visit.deviceType || detectDeviceType(visit.userAgent),
      timestamp: Date.now(),
    };
    
    data.visits.push(visitWithTimestamp);
    
    if (data.visits.length > 10000) {
      data.visits = data.visits.slice(-10000);
    }
    
    saveStatsData(data);
    console.log("[STATS] Добавлено посещение:", visit.path);
  } catch (error) {
    console.error("[STATS] Ошибка добавления посещения:", error);
  }
}

function addLoginAttempt(loginAttempt) {
  try {
    const data = getStatsData();
    const loginWithTimestamp = {
      ...loginAttempt,
      deviceType: loginAttempt.deviceType || detectDeviceType(loginAttempt.userAgent),
      timestamp: Date.now(),
    };
    
    data.loginAttempts.push(loginWithTimestamp);
    
    if (data.loginAttempts.length > 10000) {
      data.loginAttempts = data.loginAttempts.slice(-10000);
    }
    
    saveStatsData(data);
    console.log("[STATS] Добавлена попытка входа:", loginAttempt.username);
  } catch (error) {
    console.error("[STATS] Ошибка добавления попытки входа:", error);
  }
}

function getStats() {
  return getStatsData();
}

function getAggregatedStats() {
  const data = getStatsData();
  const now = Date.now();
  
  // Подсчет статистики для login requests
  const { getAllLoginRequests } = require('./login-requests');
  const allRequests = getAllLoginRequests();
  
  const approved = allRequests.filter(r => r.status === 'approved').length;
  const rejected = allRequests.filter(r => r.status === 'rejected').length;
  const pending = allRequests.filter(r => r.status === 'pending').length;
  const total = allRequests.length;
  
  return {
    approved,
    rejected,
    pending,
    total,
  };
}

function cleanupOldStats(days = 30) {
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

module.exports = {
  addVisit,
  addLoginAttempt,
  getStats,
  getAggregatedStats,
  cleanupOldStats,
  detectDeviceType,
};

