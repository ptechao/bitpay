/**
 * 前言：此檔案為代理管理相關 API 的 Mock 路由，模擬代理 CRUD 操作及分潤查詢。
 */

const express = require('express');
const router = express.Router();

// 獲取代理列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '一級代理商 A', level: 1, status: 'ACTIVE' },
      { id: 2, name: '二級代理商 B', level: 2, status: 'ACTIVE' }
    ]
  });
});

// 獲取代理分潤記錄
router.get('/:id/commissions', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 101, order_id: 'ORD_001', amount: '100.00', commission: '2.00', created_at: '2024-02-19 10:00:00' },
      { id: 102, order_id: 'ORD_002', amount: '200.00', commission: '4.00', created_at: '2024-02-19 11:00:00' }
    ]
  });
});

module.exports = router;
