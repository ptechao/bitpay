// 前言：此檔案為 Agent 微服務的入口點。
// 它初始化 Express 應用程式，設定路由，並連接到資料庫。
// 該服務負責處理所有與代理商管理相關的業務邏輯。

require("dotenv").config();
const express = require("express");
const db = require("../../src/config/db"); // 引入共用資料庫配置
const jwtAuth = require("../shared/middlewares/jwtAuth"); // 引入 JWT 認證中間件
const agentRoutes = require("./routes/agentRoutes");

const app = express();
const PORT = process.env.AGENT_SERVICE_PORT || 3003;

app.use(express.json());

// 測試資料庫連線
db.raw("SELECT 1")
  .then(() => {
    console.log("Agent Service: Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Agent Service: Failed to connect to PostgreSQL", err);
    process.exit(1);
  });

// 引入路由
app.use("/api/agents", jwtAuth, agentRoutes);

app.get("/", (req, res) => {
  res.send("Agent Service is running");
});

app.listen(PORT, () => {
  console.log(`Agent Service running on port ${PORT}`);
});
