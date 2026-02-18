// 前言：此檔案定義了 Merchant 微服務的 API 路由。
// 包含了處理商戶管理相關的端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");

// 範例路由：獲取所有商戶
router.get("/", merchantController.getAllMerchants);

// 範例路由：創建新的商戶
router.post("/", merchantController.createMerchant);

module.exports = router;
