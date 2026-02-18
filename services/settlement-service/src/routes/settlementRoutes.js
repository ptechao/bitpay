// 前言：此檔案定義了 Settlement 微服務的 API 路由。
// 包含了處理結算相關的端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const settlementController = require("../controllers/settlementController");

// 範例路由：獲取所有結算記錄
router.get("/", settlementController.getAllSettlements);

// 範例路由：創建新的結算記錄
router.post("/", settlementController.createSettlement);

module.exports = router;
