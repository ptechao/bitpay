
/**
 * @fileoverview 支付路由
 * @description 定義支付相關的 API 路由，包括建立支付訂單、查詢、接收回調、發起退款和查詢退款。
 */

const express = require("express");
const PaymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // 假設有認證中間件
const errorHandler = require("../middlewares/error.middleware"); // 假設有錯誤處理中間件

const router = express.Router();

// 建立支付訂單 (需要認證)
router.post("/", authMiddleware, PaymentController.createPayment);

// 查詢支付訂單 (需要認證)
router.get("/:orderId", authMiddleware, PaymentController.queryPayment);

// 接收支付通道回調 (不需要認證，但需要驗簽)
router.post("/callback", PaymentController.handleCallback);

// 發起退款 (需要認證)
router.post("/refunds", authMiddleware, PaymentController.createRefund);

// 查詢退款 (需要認證)
router.get("/refunds/:refundId", authMiddleware, PaymentController.queryRefund);

// 錯誤處理中間件 (路由層級)
router.use(errorHandler);

module.exports = router;
