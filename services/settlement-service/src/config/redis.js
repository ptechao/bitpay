// 檔案：src/config/redis.js
// 說明：設定 Redis 連線。

const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis 連接成功");
  } catch (err) {
    console.error("Redis 連接失敗", err);
    process.exit(1);
  }
};

module.exports = {
  redisClient: client,
  connectRedis,
};
