
/**
 * @file services/shared/lock/distributedLock.js
 * @description 聚合支付平台基於 Redis 的分散式鎖管理器。
 *              提供跨多個服務實例的互斥鎖機制，防止併發問題。
 * @author Manus AI
 * @date 2026-02-19
 */

const redis = require("../config/redis");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_LOCK_TTL = 5000; // 預設鎖的過期時間 5 秒 (毫秒)

/**
 * 分散式鎖管理器物件。
 */
const distributedLock = {
  /**
   * 嘗試獲取一個分散式鎖。
   * @param {string} lockName - 鎖的名稱。
   * @param {number} [ttl=DEFAULT_LOCK_TTL] - 鎖的過期時間 (毫秒)。
   * @returns {Promise<string|null>} 如果成功獲取鎖，返回一個唯一的鎖值 (用於釋放鎖)，否則返回 null。
   */
  acquireLock: async (lockName, ttl = DEFAULT_LOCK_TTL) => {
    const lockValue = uuidv4(); // 生成一個唯一的鎖值，用於識別鎖的持有者
    try {
      // 使用 SET key value NX PX milliseconds 命令
      // NX: 只在鍵不存在時才設置
      // PX: 設置鍵的過期時間 (毫秒)
      const result = await redis.set(lockName, lockValue, "NX", "PX", ttl);
      if (result === "OK") {
        console.log(`[DistributedLock] 成功獲取鎖: ${lockName}，值: ${lockValue}`);
        return lockValue;
      }
      return null; // 未能獲取鎖
    } catch (error) {
      console.error(`[DistributedLock] 獲取鎖失敗: ${lockName}, 錯誤:`, error);
      return null;
    }
  },

  /**
   * 釋放一個分散式鎖。
   * 只有鎖的持有者才能釋放鎖，防止誤釋放。
   * @param {string} lockName - 鎖的名稱。
   * @param {string} lockValue - 獲取鎖時返回的唯一鎖值。
   * @returns {Promise<boolean>} 如果成功釋放鎖則返回 true，否則返回 false。
   */
  releaseLock: async (lockName, lockValue) => {
    // 使用 Lua 腳本確保原子性：檢查鎖值是否匹配，然後刪除鍵
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    try {
      const result = await redis.eval(script, 1, lockName, lockValue);
      if (result === 1) {
        console.log(`[DistributedLock] 成功釋放鎖: ${lockName}`);
        return true;
      }
      console.warn(`[DistributedLock] 釋放鎖失敗或鎖已被其他實例持有/過期: ${lockName}`);
      return false;
    } catch (error) {
      console.error(`[DistributedLock] 釋放鎖失敗: ${lockName}, 錯誤:`, error);
      return false;
    }
  },
};

module.exports = distributedLock;
