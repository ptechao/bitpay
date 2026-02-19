// 前言：此檔案為 Merchant 微服務的入口點。
// 它初始化 Express 應用程式，設定路由，並連接到資料庫。
// 該服務負責處理所有與商戶管理相關的業務邏輯。

require("dotenv").config();
const express = require("express");
const db = require("../shared/config/database"); // 引入共用資料庫配置
const jwtAuth = require("../shared/middlewares/jwtAuth"); // 引入 JWT 認證中間件
const merchantRoutes = require("./src/routes/merchantRoutes");

const app = express();
const PORT = process.env.MERCHANT_SERVICE_PORT || 3002;

app.use(express.json());

// 測試資料庫連線
db.raw("SELECT 1")
  .then(() => {
    console.log("Merchant Service: Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Merchant Service: Failed to connect to PostgreSQL", err);
    process.exit(1);
  });

// 引入路由
app.use("/api/merchants", jwtAuth, merchantRoutes);

app.get("/", (req, res) => {
  res.send("Merchant Service is running");
});

app.listen(PORT, () => {
  console.log(`Merchant Service running on port ${PORT}`);
});
