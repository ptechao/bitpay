// 前言：此檔案用於匯出共用資料庫連線實例。
// 它引入了 `services/shared/config/database.js` 中定義的 Knex.js 配置，
// 確保所有微服務都使用統一的資料庫連線池和查詢建構器。

const db = require("../../services/shared/config/database");

module.exports = db;
