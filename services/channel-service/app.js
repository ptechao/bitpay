// app.js
/**
 * @file 聚合支付平台通道管理服務主應用程式
 * @description 負責初始化 Express 應用、載入配置、連接資料庫、設定路由及錯誤處理。
 * @author Manus AI
 */

require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const channelRoutes = require("./src/routes/channelRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const { errorHandler } = require("./src/middlewares/errorHandler");
const db = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");

// 連接資料庫
db.raw("SELECT 1").then(() => console.log("DB connected")).catch(err => console.error("DB connection failed:", err));
// 連接 Redis
connectRedis();

// 中介軟體
app.use(bodyParser.json());
app.use(express.json());

// 路由
app.use("/api/v1/channels", channelRoutes);
app.use('/api/v1/admin', adminRoutes);

// 錯誤處理中介軟體
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`通道管理服務運行於端口 ${PORT}`);
});

module.exports = app;
