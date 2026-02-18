// src/config/redis.js
/**
 * @file 通道管理服務 Redis 連接配置
 * @description 負責建立與 Redis 的連接。
 * @author Manus AI
 */

const redis = require("redis");

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    await redisClient.connect();
    console.log("Redis 連接成功");
  } catch (err) {
    console.error("Redis 連接失敗", err);
    process.exit(1);
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};
