// services/channel-service/src/models/channelModel.js
// 前言：此檔案定義了通道相關的資料庫操作模型，使用 Supabase 客戶端進行查詢。

const supabase = require("../config/supabase");

const TABLE_NAME = "payment_channels";

const ChannelModel = {
  async createChannel(channelData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([channelData])
      .select();

    if (error) {
      console.error("Error creating channel:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  async getChannelById(channelId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", channelId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Error fetching channel by ID:", error);
      throw new Error(error.message);
    }
    return data;
  },

  async updateChannelStatus(channelId, status) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", channelId)
      .select();

    if (error) {
      console.error("Error updating channel status:", error);
      throw new Error(error.message);
    }
    return data[0];
  },

  // 更多通道相關的資料庫操作可以依此模式添加
};

module.exports = ChannelModel;
