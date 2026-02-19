// 前言：此檔案為 Channel 微服務的入口點。
// 它初始化 Express 應用程式，設定路由，並連接到資料庫。
// 該服務負責處理所有與支付通道管理相關的業務邏輯。

require("dotenv").config();
const express = require("express");
const db = require("../shared/config/database"); // 引入共用資料庫配置
const jwtAuth = require("../shared/middlewares/jwtAuth"); // 引入 JWT 認證中間件
const channelRoutes = require("./src/routes/channelRoutes");

const app = express();
const PORT = process.env.CHANNEL_SERVICE_PORT || 3006;

app.use(express.json());

// 測試資料庫連線
db.raw("SELECT 1")
  .then(() => {
    console.log("Channel Service: Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Channel Service: Failed to connect to PostgreSQL", err);
    process.exit(1);
  });

// 引入路由
app.use("/api/channels", jwtAuth, channelRoutes);

app.get("/", (req, res) => {
  res.send("Channel Service is running");
});

app.listen(PORT, () => {
  console.log(`Channel Service running on port ${PORT}`);
});
