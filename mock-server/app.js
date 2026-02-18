/**
 * 前言：此檔案為 Mock API Server 的主入口，負責初始化 Express 應用、設定中間件並掛載路由。
 * 支援 CORS、模擬延遲及錯誤場景。
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const merchantRoutes = require('./routes/merchants');
const agentRoutes = require('./routes/agents');
const settlementRoutes = require('./routes/settlements');
const channelRoutes = require('./routes/channels');
const riskRoutes = require('./routes/risk');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件設定
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 模擬延遲中間件 (可配置)
const MOCK_DELAY = process.env.MOCK_DELAY || 500; // 預設 500ms
app.use((req, res, next) => {
  setTimeout(next, MOCK_DELAY);
});

// 路由掛載
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/risk', riskRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '伺服器內部錯誤',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Mock Server 正在運行於 http://localhost:\${PORT}`);
});
