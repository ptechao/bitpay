// 前言：此檔案定義了 Channel 微服務的 API 路由。
// 包含了處理支付通道管理相關的端點，並使用 JWT 認證中間件保護。

const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");

// 範例路由：獲取所有支付通道
router.get("/", channelController.getAllChannels);

// 範例路由：創建新的支付通道
router.post("/", channelController.createChannel);

module.exports = router;
