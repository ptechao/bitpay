// 前言：此檔案定義了 Agent 微服務的控制器邏輯。
// 包含了處理代理商管理相關請求的方法，例如獲取所有代理商和創建代理商。

const AgentModel = require("../models/agentModel");

const getAllAgents = async (req, res) => {
  try {
    const agents = await AgentModel.findAll();
    res.status(200).json(agents);
  } catch (error) {
    console.error("Error getting all agents:", error);
    res.status(500).json({ message: "獲取代理商資訊失敗", error: error.message });
  }
};

const createAgent = async (req, res) => {
  try {
    const newAgent = await AgentModel.create(req.body);
    res.status(201).json(newAgent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "創建代理商失敗", error: error.message });
  }
};

module.exports = {
  getAllAgents,
  createAgent,
};
