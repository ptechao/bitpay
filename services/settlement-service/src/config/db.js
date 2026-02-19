// 此檔案匯出共用的 Knex.js 資料庫連線實例。
// 已從 Supabase 遷移至自建 PostgreSQL，使用 Knex.js 作為查詢建構器。
const db = require("../../../shared/config/database");
module.exports = db;
