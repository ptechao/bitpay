/**
 * 前言：此檔案為結算相關 API 的 Mock 路由，模擬結算單查詢及提現申請。
 */

const express = require('express');
const router = express.Router();

// 獲取結算單列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, date: '2024-02-18', amount: '1000.00', status: 'SETTLED' },
      { id: 2, date: '2024-02-19', amount: '1500.00', status: 'PENDING' }
    ]
  });
});

// 提現申請
router.post('/withdraw', (req, res) => {
  const { amount, account_id } = req.body;
  res.json({
    code: 200,
    message: '提現申請已提交',
    data: { id: Date.now(), amount, status: 'PROCESSING' }
  });
});

module.exports = router;
