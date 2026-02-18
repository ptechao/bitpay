// services/risk-control-service/src/config/db.js
// 前言：此檔案已更新為使用 Supabase 客戶端進行資料庫連線。

const supabase = require("./supabase");

// 為了與原有 pg Pool 介面保持一致，這裡提供一個簡易的查詢方法。
// 在實際應用中，建議直接使用 supabase 客戶端進行更靈活的查詢。
const db = {
  query: async (sql, params) => {
    // 這裡需要根據實際的 SQL 語句和 Supabase Client 的 API 進行轉換。
    // Supabase Client 主要透過 .from().select().eq() 等方法操作，不直接執行原始 SQL。
    // 為了示範，這裡只是一個佔位符，實際應用需要更複雜的邏輯來解析 SQL 或直接重寫模型層。
    console.warn("Warning: Direct SQL query through db.query is deprecated. Please use Supabase client methods.");
    // 假設這裡會有一些邏輯來將 SQL 轉換為 Supabase 查詢
    // 例如：
    // if (sql.startsWith("SELECT")) {
    //   return supabase.from("your_table").select("*");
    // }
    throw new Error("Direct SQL query is not supported with Supabase client in this adapter. Please refactor your model queries.");
  },
  supabase: supabase // 暴露 Supabase 客戶端以便直接使用
};

module.exports = db;
