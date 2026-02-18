// 前言：此檔案定義了 Payment 微服務的 API 路由。
// 包含了處理支付交易的相關端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// 範例路由：獲取所有支付交易
router.get("/", paymentController.getAllPayments);

// 範例路由：創建新的支付交易
router.post("/", paymentController.createPayment);

module.exports = router;
