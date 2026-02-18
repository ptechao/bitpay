
/**
 * @file services/shared/middlewares/idempotency.js
 * @description 聚合支付平台基於 Redis 的冪等性中介軟體。
 *              確保相同的請求在多次提交時只被處理一次，防止重複操作。
 * @author Manus AI
 * @date 2026-02-19
 */

const redis = require("../config/redis");

const IDEMPOTENCY_KEY_PREFIX = "idempotency:";
const IDEMPOTENCY_EXPIRATION_SECONDS = 60 * 60; // 冪等性鍵有效期為 1 小時

/**
 * 冪等性中介軟體。
 * 客戶端應在請求頭中提供 `Idempotency-Key`。
 * @returns {Function} Express 中介軟體函數。
 */
const idempotency = () => {
  return async (req, res, next) => {
    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey) {
      // 如果沒有提供冪等性鍵，則直接繼續，不提供冪等性保護
      // 根據業務需求，這裡也可以選擇返回 400 錯誤
      return next();
    }

    const redisKey = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

    try {
      const cachedResponse = await redis.get(redisKey);

      if (cachedResponse) {
        const { status, headers, body } = JSON.parse(cachedResponse);
        // 如果已經有緩存的響應，直接返回
        console.log(`[Idempotency] 返回緩存響應，鍵: ${idempotencyKey}`);
        Object.keys(headers).forEach(header => {
          res.setHeader(header, headers[header]);
        });
        return res.status(status).send(body);
      }

      // 嘗試設置一個佔位符，表示請求正在處理中
      const setNxResult = await redis.set(redisKey, JSON.stringify({ status: 'processing' }), 'EX', IDEMPOTENCY_EXPIRATION_SECONDS, 'NX');

      if (!setNxResult) {
        // 如果設置失敗，表示另一個相同的請求正在處理中或已完成
        console.warn(`[Idempotency] 檢測到重複請求，鍵: ${idempotencyKey}`);
        return res.status(409).json({ code: "409", message: "請求正在處理中或已完成，請勿重複提交。" });
      }

      // 劫持 res.send 和 res.json 來緩存響應
      const originalSend = res.send;
      const originalJson = res.json;

      res.send = (body) => {
        const responseToCache = {
          status: res.statusCode,
          headers: res.getHeaders(),
          body: body,
        };
        redis.set(redisKey, JSON.stringify(responseToCache), 'EX', IDEMPOTENCY_EXPIRATION_SECONDS);
        originalSend.call(res, body);
      };

      res.json = (body) => {
        const responseToCache = {
          status: res.statusCode,
          headers: res.getHeaders(),
          body: body,
        };
        redis.set(redisKey, JSON.stringify(responseToCache), 'EX', IDEMPOTENCY_EXPIRATION_SECONDS);
        originalJson.call(res, body);
      };

      next();
    } catch (error) {
      console.error("[Idempotency] 處理冪等性鍵時發生錯誤:", error);
      // 如果 Redis 發生錯誤，為了不阻斷服務，繼續處理請求
      next();
    }
  };
};

module.exports = idempotency;
