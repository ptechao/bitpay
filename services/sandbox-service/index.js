
/**
 * @file services/sandbox-service/index.js
 * @description 聚合支付平台沙盒服務的 Express 應用程式入口點。
 *              提供商戶對接測試環境，模擬支付流程與回調機制。
 * @author Manus AI
 * @date 2026-02-19
 */

const express = require('express');
const bodyParser = require('body-parser');
const sandboxRoutes = require('./src/routes/sandboxRoutes');
const { initializeDatabase } = require('./src/models/sandboxModel');

const app = express();
const PORT = process.env.SANDBOX_SERVICE_PORT || 3001;

// 中介軟體
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/sandbox', sandboxRoutes);

// 啟動伺服器
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`沙盒服務運行於 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('啟動沙盒服務失敗:', error);
    process.exit(1);
  }
};

startServer();
