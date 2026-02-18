
/**
 * @file services/shared/cache/cacheManager.js
 * @description 聚合支付平台基於 Redis 的快取管理器。
 *              提供設定、獲取和刪除快取的功能。
 * @author Manus AI
 * @date 2026-02-19
 */

const redis = require("../config/redis");

const DEFAULT_TTL = 60 * 5; // 預設快取時間 5 分鐘 (秒)

/**
 * 快取管理器物件。
 */
const cacheManager = {
  /**
   * 設定快取值。
   * @param {string} key - 快取的鍵。
   * @param {any} value - 要快取的值。
   * @param {number} [ttl=DEFAULT_TTL] - 快取的有效時間 (秒)。
   * @returns {Promise<string>} Redis 操作結果。
   */
  set: async (key, value, ttl = DEFAULT_TTL) => {
    try {
      const serializedValue = JSON.stringify(value);
      return await redis.set(key, serializedValue, "EX", ttl);
    } catch (error) {
      console.error(`[CacheManager] 設定快取失敗，鍵: ${key}, 錯誤:`, error);
      return null;
    }
  },

  /**
   * 獲取快取值。
   * @param {string} key - 快取的鍵。
   * @returns {Promise<any|null>} 快取的值，如果不存在或過期則返回 null。
   */
  get: async (key) => {
    try {
      const cachedValue = await redis.get(key);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
      return null;
    } catch (error) {
      console.error(`[CacheManager] 獲取快取失敗，鍵: ${key}, 錯誤:`, error);
      return null;
    }
  },

  /**
   * 刪除快取值。
   * @param {string} key - 快取的鍵。
   * @returns {Promise<number>} 被刪除的鍵的數量 (1 表示成功，0 表示鍵不存在)。
   */
  del: async (key) => {
    try {
      return await redis.del(key);
    } catch (error) {
      console.error(`[CacheManager] 刪除快取失敗，鍵: ${key}, 錯誤:`, error);
      return 0;
    }
  },

  /**
   * 檢查快取鍵是否存在。
   * @param {string} key - 快取的鍵。
   * @returns {Promise<boolean>} 如果鍵存在則返回 true，否則返回 false。
   */
  exists: async (key) => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`[CacheManager] 檢查快取鍵是否存在失敗，鍵: ${key}, 錯誤:`, error);
      return false;
    }
  },

  /**
   * 清空所有快取 (請謹慎使用，通常只在測試或開發環境使用)。
   * @returns {Promise<string>} Redis 操作結果。
   */
  clearAll: async () => {
    try {
      console.warn("[CacheManager] 正在清空所有 Redis 快取！");
      return await redis.flushdb();
    } catch (error) {
      console.error("[CacheManager] 清空所有快取失敗，錯誤:", error);
      return null;
    }
  },
};

module.exports = cacheManager;
