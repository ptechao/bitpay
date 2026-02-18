// 前言：此檔案定義了 Channel 微服務的控制器邏輯。
// 包含了處理支付通道管理相關請求的方法，例如獲取所有支付通道和創建支付通道。

const ChannelModel = require("../models/channelModel");

const getAllChannels = async (req, res) => {
  try {
    const channels = await ChannelModel.findAll();
    res.status(200).json(channels);
  } catch (error) {
    console.error("Error getting all channels:", error);
    res.status(500).json({ message: "獲取支付通道失敗", error: error.message });
  }
};

const createChannel = async (req, res) => {
  try {
    const newChannel = await ChannelModel.create(req.body);
    res.status(201).json(newChannel);
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "創建支付通道失敗", error: error.message });
  }
};

module.exports = {
  getAllChannels,
  createChannel,
};
