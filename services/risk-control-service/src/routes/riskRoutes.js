// src/routes/riskRoutes.js
/**
 * @file 風控服務路由定義
 * @description 定義風控相關的 API 端點，包括交易風控審核、規則管理、黑白名單管理等。
 * @author Manus AI
 */

const express = require("express");
const router = express.Router();
const riskController = require("../controllers/riskController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

// 提交交易進行風控審核
router.post("/evaluate", authenticateJWT, riskController.evaluateTransaction);

// 查詢風控規則
router.get("/rules", authenticateJWT, riskController.getRiskRules);

// 配置風控規則
router.put("/rules", authenticateJWT, riskController.updateRiskRules);

// 新增黑名單
router.post("/blacklist", authenticateJWT, riskController.addBlacklistItem);

// 移除黑名單
router.delete("/blacklist/:id", authenticateJWT, riskController.removeBlacklistItem);

// 查詢黑名單
router.get("/blacklist", authenticateJWT, riskController.getBlacklist);

// 新增白名單
router.post("/whitelist", authenticateJWT, riskController.addWhitelistItem);

// 移除白名單
router.delete("/whitelist/:id", authenticateJWT, riskController.removeWhitelistItem);

// 查詢白名單
router.get("/whitelist", authenticateJWT, riskController.getWhitelist);

module.exports = router;
