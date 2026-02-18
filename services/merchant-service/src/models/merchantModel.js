// services/merchant-service/src/models/merchantModel.js
// 前言：此檔案定義了商戶相關的資料庫操作模型，使用 Supabase 客戶端進行查詢。

const supabase = require("../config/supabase");

const TABLE_NAME = "merchants";

const MerchantModel = {
  async createMerchant(merchantData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([merchantData])
      .select();

    if (error) {
      console.error("Error creating merchant:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  async getMerchantById(merchantId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", merchantId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Error fetching merchant by ID:", error);
      throw new Error(error.message);
    }
    return data;
  },

  async updateMerchantStatus(merchantId, status) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", merchantId)
      .select();

    if (error) {
      console.error("Error updating merchant status:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  // 更多商戶相關的資料庫操作可以依此模式添加
};

module.exports = MerchantModel;
