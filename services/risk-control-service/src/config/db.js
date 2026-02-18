// src/config/db.js
/**
 * @file 通道管理服務資料庫連接配置
 * @description 負責建立與 PostgreSQL 資料庫的連接。
 * @author Manus AI
 */

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("PostgreSQL 資料庫連接成功");
  } catch (err) {
    console.error("PostgreSQL 資料庫連接失敗", err);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
};
