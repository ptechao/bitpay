
/**
 * @file services/shared/security/sensitiveLogger.js
 * @description 聚合支付平台敏感資訊日誌記錄器。
 *              在記錄日誌時自動遮蔽指定的敏感數據，確保合規性。
 * @author Manus AI
 * @date 2026-02-19
 */

const { maskObjectFields } = require("../security/datamasking");

// 定義需要遮蔽的敏感欄位列表
const SENSITIVE_FIELDS = [
  "password",
  "creditCardNumber",
  "cvv",
  "accountNumber",
  "bankAccount",
  "idNumber",
  "ssn",
  "privateKey",
  "secret",
  "apiKey",
  "apiSecret",
  "accessToken",
  "refreshToken",
  "email", // 郵箱也可能被視為敏感資訊
  "phone",
];

/**
 * 敏感資訊日誌記錄器。
 * @param {object} logger - 實際的日誌記錄器實例 (例如 Winston, Pino 等)。
 * @returns {object} 帶有敏感資訊遮蔽功能的日誌記錄器。
 */
const sensitiveLogger = (logger) => {
  if (!logger || typeof logger.info !== "function") {
    console.warn("警告: 提供的 logger 實例無效，敏感日誌功能可能無法正常工作。");
    // 返回一個空操作的 logger，避免錯誤
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      // 根據實際 logger 接口添加更多方法
    };
  }

  const maskedLogger = {};

  // 遍歷原始 logger 的所有方法，並對其進行包裝
  for (const level of ["info", "warn", "error", "debug", "log"]) { // 假設 logger 有這些方法
    if (typeof logger[level] === "function") {
      maskedLogger[level] = (...args) => {
        const processedArgs = args.map(arg => {
          if (typeof arg === "object" && arg !== null) {
            return maskObjectFields(arg, SENSITIVE_FIELDS);
          }
          return arg;
        });
        logger[level](...processedArgs);
      };
    }
  }

  return maskedLogger;
};

module.exports = sensitiveLogger;
