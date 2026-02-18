"""riskControlModel.js"""
// services/risk-control-service/src/models/riskControlModel.js
// 前言：此檔案定義了風控相關的資料庫操作模型，使用 Supabase 客戶端進行查詢。

const supabase = require("../config/supabase");

const TABLE_NAME = "risk_events"; // 假設有一個風險事件表

const RiskControlModel = {
  async createRiskEvent(eventData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([eventData])
      .select();

    if (error) {
      console.error("Error creating risk event:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  async getRiskEventById(eventId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", eventId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Error fetching risk event by ID:", error);
      throw new Error(error.message);
    }
    return data;
  },

  async updateRiskEventStatus(eventId, status) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Error updating risk event status:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  // 更多風控相關的資料庫操作可以依此模式添加
};

module.exports = RiskControlModel;
