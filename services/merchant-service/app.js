
/**
 * @fileoverview 商戶服務應用入口
 * @description 初始化 Express 應用，設定路由、中間件和錯誤處理。
 */

const express = require("express");
const dotenv = require("dotenv");
const merchantRoutes = require("./src/routes/merchant.routes");

dotenv.config();

const app = express();

// 中間件
app.use(express.json()); // 解析 JSON 格式的請求體

// 路由
app.use("/api/v1/merchants", merchantRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "內部伺服器錯誤",
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`商戶服務運行在埠號 ${PORT}`);
});

module.exports = app;
