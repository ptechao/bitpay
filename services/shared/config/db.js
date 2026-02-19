// 此檔案匯出共用的 Knex.js 資料庫連線實例。
// 確保所有微服務都使用統一的資料庫連線池和查詢建構器。
const db = require("./database");
module.exports = db;
