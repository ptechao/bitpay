// services/settlement-service/src/models/settlementModel.js
// 前言：此檔案定義了結算相關的資料庫操作模型，使用 Supabase 客戶端進行查詢。

const supabase = require("../config/supabase");

const TABLE_NAME = "settlements";

const SettlementModel = {
  async createSettlement(settlementData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([settlementData])
      .select();

    if (error) {
      console.error("Error creating settlement:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  async getSettlementById(settlementId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", settlementId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Error fetching settlement by ID:", error);
      throw new Error(error.message);
    }
    return data;
  },

  async updateSettlementStatus(settlementId, status) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", settlementId)
      .select();

    if (error) {
      console.error("Error updating settlement status:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  // 更多結算相關的資料庫操作可以依此模式添加
};

module.exports = SettlementModel;
