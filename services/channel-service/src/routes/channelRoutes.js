// src/routes/channelRoutes.js
/**
 * @file 通道管理服務路由定義
 * @description 定義通道相關的 API 端點，包括通道的增刪改查、幣種配置、健康狀態監控等。
 * @author Manus AI
 */

const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

// 新增支付通道
router.post("/", authenticateJWT, channelController.createChannel);

// 查詢所有通道
router.get("/", authenticateJWT, channelController.getAllChannels);

// 查詢通道詳情
router.get("/:channelId", authenticateJWT, channelController.getChannelDetails);

// 更新通道配置
router.put("/:channelId", authenticateJWT, channelController.updateChannel);

// 停用通道 (邏輯刪除)
router.delete("/:channelId", authenticateJWT, channelController.deactivateChannel);

// 查詢通道支援的幣種
router.get("/:channelId/currencies", authenticateJWT, channelController.getChannelCurrencies);

// 配置通道支援的幣種
router.post("/:channelId/currencies", authenticateJWT, channelController.configureChannelCurrencies);

// 通道健康狀態監控
router.get("/status", authenticateJWT, channelController.getChannelStatus);

module.exports = router;
