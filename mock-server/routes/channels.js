/**
 * 前言：此檔案為通道管理相關 API 的 Mock 路由，模擬通道 CRUD 操作。
 */

const express = require('express');
const router = express.Router();

// 獲取通道列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '支付寶 (Alipay)', code: 'ALIPAY', status: 'ACTIVE', rate: '1.2%' },
      { id: 2, name: '微信支付 (WeChat Pay)', code: 'WECHAT', status: 'ACTIVE', rate: '1.2%' },
      { id: 3, name: 'USDT (TRC20)', code: 'USDT_TRC20', status: 'ACTIVE', rate: '0.5%' }
    ]
  });
});

// 更新通道狀態
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  res.json({
    code: 200,
    message: '通道狀態更新成功',
    data: { id, status }
  });
});

module.exports = router;
