// 前言：此檔案定義了 Merchant 微服務的控制器邏輯。
// 包含了處理商戶管理相關請求的方法，例如獲取所有商戶和創建商戶。

const MerchantModel = require("../models/merchantModel");

const getAllMerchants = async (req, res) => {
  try {
    const merchants = await MerchantModel.findAll();
    res.status(200).json(merchants);
  } catch (error) {
    console.error("Error getting all merchants:", error);
    res.status(500).json({ message: "獲取商戶資訊失敗", error: error.message });
  }
};

const createMerchant = async (req, res) => {
  try {
    const newMerchant = await MerchantModel.create(req.body);
    res.status(201).json(newMerchant);
  } catch (error) {
    console.error("Error creating merchant:", error);
    res.status(500).json({ message: "創建商戶失敗", error: error.message });
  }
};

module.exports = {
  getAllMerchants,
  createMerchant,
};
