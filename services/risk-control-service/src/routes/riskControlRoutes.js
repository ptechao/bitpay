// 前言：此檔案定義了 Risk-Control 微服務的 API 路由。
// 包含了處理風險控制相關的端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const riskControlController = require("../controllers/riskControlController");

// 範例路由：獲取所有風控規則
router.get("/rules", riskControlController.getAllRiskRules);

// 範例路由：創建新的風控規則
router.post("/rules", riskControlController.createRiskRule);

module.exports = router;
