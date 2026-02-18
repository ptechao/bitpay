// 前言：此檔案定義了 Risk-Control 微服務的控制器邏輯。
// 包含了處理風險控制相關請求的方法，例如獲取所有風控規則和創建風控規則。

const RiskControlModel = require("../models/riskControlModel");

const getAllRiskRules = async (req, res) => {
  try {
    const rules = await RiskControlModel.findAllRules();
    res.status(200).json(rules);
  } catch (error) {
    console.error("Error getting all risk rules:", error);
    res.status(500).json({ message: "獲取風控規則失敗", error: error.message });
  }
};

const createRiskRule = async (req, res) => {
  try {
    const newRule = await RiskControlModel.createRule(req.body);
    res.status(201).json(newRule);
  } catch (error) {
    console.error("Error creating risk rule:", error);
    res.status(500).json({ message: "創建風控規則失敗", error: error.message });
  }
};

module.exports = {
  getAllRiskRules,
  createRiskRule,
};
