/**
 * 前言：此檔案為風控規則相關 API 的 Mock 路由，模擬風控規則 CRUD 操作。
 */

const express = require('express');
const router = express.Router();

// 獲取風控規則列表
router.get('/rules', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '單筆交易限額', value: '50000', status: 'ACTIVE' },
      { id: 2, name: '每日交易限額', value: '200000', status: 'ACTIVE' },
      { id: 3, name: '黑名單 IP 過濾', value: '127.0.0.1', status: 'ACTIVE' }
    ]
  });
});

// 更新風控規則
router.put('/rules/:id', (req, res) => {
  const { id } = req.params;
  const { value, status } = req.body;
  res.json({
    code: 200,
    message: '風控規則更新成功',
    data: { id, value, status }
  });
});

module.exports = router;
