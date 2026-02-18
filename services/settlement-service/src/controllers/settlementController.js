// 前言：此檔案定義了 Settlement 微服務的控制器邏輯。
// 包含了處理結算相關請求的方法，例如獲取所有結算記錄和創建結算記錄。

const SettlementModel = require("../models/settlementModel");

const getAllSettlements = async (req, res) => {
  try {
    const settlements = await SettlementModel.findAll();
    res.status(200).json(settlements);
  } catch (error) {
    console.error("Error getting all settlements:", error);
    res.status(500).json({ message: "獲取結算記錄失敗", error: error.message });
  }
};

const createSettlement = async (req, res) => {
  try {
    const newSettlement = await SettlementModel.create(req.body);
    res.status(201).json(newSettlement);
  } catch (error) {
    console.error("Error creating settlement:", error);
    res.status(500).json({ message: "創建結算記錄失敗", error: error.message });
  }
};

module.exports = {
  getAllSettlements,
  createSettlement,
};
