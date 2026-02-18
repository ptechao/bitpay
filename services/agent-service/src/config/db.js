// 檔案：src/config/db.js
// 說明：設定 PostgreSQL 資料庫連接。

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
  query: (text, params) => pool.query(text, params),
  connectDB,
};
