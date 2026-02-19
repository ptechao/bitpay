// 檔案：app.js
// 說明：結算服務的入口點，負責設定 Express 應用程式、資料庫連線、Redis 連線、路由、排程任務和錯誤處理。

require("dotenv").config();
const express = require("express");
const app = express();
const settlementRoutes = require("./src/routes/settlementRoutes");
const db = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const errorHandler = require("./src/middlewares/errorHandler");
const { startSettlementJob } = require("./src/jobs/settlementJob");

// 連接資料庫和 Redis
db.raw("SELECT 1").then(() => console.log("DB connected")).catch(err => console.error("DB connection failed:", err));
connectRedis();

// 中介軟體
app.use(express.json()); // 解析 JSON 格式的請求體

// 路由
app.use("/api/v1/settlements", settlementRoutes);

// 錯誤處理中介軟體
app.use(errorHandler);

// 啟動自動結算排程
startSettlementJob();

// 啟動伺服器
const PORT = process.env.PORT || 3001; // 使用不同的埠號以避免衝突
app.listen(PORT, () => {
  console.log(`結算服務已啟動，監聽埠號 ${PORT}`);
});
