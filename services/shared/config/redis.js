
/**
 * @file services/shared/config/redis.js
 * @description 聚合支付平台 Redis 連線配置。
 *              使用 ioredis 庫建立與 Redis 伺服器的連線。
 * @author Manus AI
 * @date 2026-02-19
 */

const Redis = require("ioredis");

const redisConfig = {
  port: process.env.REDIS_PORT || 6379, // Redis 端口
  host: process.env.REDIS_HOST || "redis", // Redis 主機，在 Docker Compose 中為服務名稱
  password: process.env.REDIS_PASSWORD || undefined, // Redis 密碼
  db: process.env.REDIS_DB || 0, // Redis 資料庫索引
  maxRetriesPerRequest: null, // 禁用自動重試，由應用程式層處理
  enableOfflineQueue: true, // 連線斷開時，命令會被放入佇列等待重新連線
};

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("Redis 連線成功!");
});

redis.on("error", (err) => {
  console.error("Redis 連線錯誤:", err);
});

redis.on("reconnecting", (delay) => {
  console.log(`Redis 正在重新連線... 延遲: ${delay}ms`);
});

redis.on("end", () => {
  console.log("Redis 連線已斷開。");
});

module.exports = redis;
