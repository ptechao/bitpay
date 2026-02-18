
/**
 * @fileoverview 商戶路由
 * @description 定義商戶相關的 API 路由，包括註冊、查詢、更新、支付配置和結算週期設定。
 */

const express = require("express");
const MerchantController = require("../controllers/merchant.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // 假設有認證中間件

const router = express.Router();

// 商戶註冊
router.post("/register", MerchantController.registerMerchant);

// 查詢商戶資訊 (需要認證)
router.get("/:merchantId", authMiddleware, MerchantController.getMerchantInfo);

// 更新商戶資訊 (需要認證)
router.put("/:merchantId", authMiddleware, MerchantController.updateMerchantInfo);

// 配置支付參數 (需要認證)
router.put("/:merchantId/payment-config", authMiddleware, MerchantController.configurePayment);

// 查詢交易記錄 (需要認證)
router.get("/:merchantId/transactions", authMiddleware, MerchantController.getTransactions);

// 設定結算週期 (需要認證)
router.put("/:merchantId/settlement-config", authMiddleware, MerchantController.setSettlementConfig);

module.exports = router;
