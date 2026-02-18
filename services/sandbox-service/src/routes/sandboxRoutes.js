
/**
 * @file services/sandbox-service/src/routes/sandboxRoutes.js
 * @description 聚合支付平台沙盒服務的路由定義。
 *              將 API 路徑映射到對應的控制器功能。
 * @author Manus AI
 * @date 2026-02-19
 */

const express = require("express");
const sandboxController = require("../controllers/sandboxController");

const router = express.Router();

// 創建沙盒訂單
router.post("/orders", sandboxController.createOrder);

// 模擬支付結果
router.post("/payments/simulate", sandboxController.simulatePayment);

// 查詢沙盒訂單
router.get("/orders/:orderId", sandboxController.getSandboxOrder);

module.exports = router;
