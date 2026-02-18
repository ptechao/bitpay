
/**
 * @file services/shared/middlewares/rateLimiter.js
 * @description 聚合支付平台基於 Redis 的限流中介軟體。
 *              使用滑動窗口演算法限制來自特定 IP 或用戶的請求頻率。
 * @author Manus AI
 * @date 2026-02-19
 */

const redis = require("../config/redis");

/**
 * 限流中介軟體。
 * @param {number} limit - 在 `windowMs` 時間內允許的最大請求數。
 * @param {number} windowMs - 時間窗口的毫秒數。
 * @returns {Function} Express 中介軟體函數。
 */
const rateLimiter = (limit, windowMs) => {
  return async (req, res, next) => {
    const key = `rate_limit:${req.ip}`; // 使用 IP 地址作為限流的鍵
    const now = Date.now();
    const windowStart = now - windowMs;

    // 使用 Redis 的 ZREM 和 ZADD 命令實現滑動窗口
    // ZREM 移除時間窗口外的舊請求
    // ZADD 添加新請求
    // ZCOUNT 計算當前窗口內的請求數
    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, now);
    multi.expire(key, Math.ceil(windowMs / 1000)); // 設置鍵的過期時間，防止鍵無限增長
    multi.zcard(key);

    const [[,
      ,
      ,
      [, count],
    ]] = await multi.exec();

    if (count > limit) {
      return res.status(429).json({ code: "429", message: "請求過於頻繁，請稍後再試。" });
    }

    next();
  };
};

module.exports = rateLimiter;
