// 前言：此檔案定義了 Agent 微服務的 API 路由。
// 包含了處理代理商管理相關的端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

// 範例路由：獲取所有代理商
router.get("/", agentController.getAllAgents);

// 範例路由：創建新的代理商
router.post("/", agentController.createAgent);

module.exports = router;
