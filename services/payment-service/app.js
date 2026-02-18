
/**
 * @fileoverview 支付服務應用入口
 * @description 初始化 Express 應用，設定路由、中間件和錯誤處理。
 */

const express = require("express");
const dotenv = require("dotenv");
const paymentRoutes = require("./src/routes/payment.routes");
const errorHandler = require("./src/middlewares/error.middleware");

dotenv.config();

const app = express();

// 中間件
app.use(express.json()); // 解析 JSON 格式的請求體

// 路由
app.use("/api/v1/payments", paymentRoutes);

// 錯誤處理中間件
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`支付服務運行在埠號 ${PORT}`);
});

module.exports = app;
