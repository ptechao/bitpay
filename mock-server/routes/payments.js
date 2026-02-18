/**
 * 前言：此檔案為支付相關 API 的 Mock 路由，模擬建立訂單、查詢訂單及支付回調。
 * 包含模擬支付成功、失敗及超時場景。
 */

const express = require('express');
const router = express.Router();
const { mockPayment } = require('../utils/mockPayment');
const { mockCallback } = require('../utils/mockCallback');

// 建立支付訂單
router.post('/', (req, res) => {
  const { merchant_id, order_id, amount, currency, channel } = req.body;

  if (!merchant_id || !order_id || !amount || !currency) {
    return res.status(400).json({
      code: 4002,
      message: '參數缺失',
      data: null
    });
  }

  // 模擬成功回應
  const platform_order_id = 'PAY_' + Date.now();
  const pay_url = `https://pay.example.com/checkout/\${platform_order_id}`;
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      order_id,
      platform_order_id,
      pay_url,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${pay_url}`,
      status: 'PENDING'
    }
  });

  // 模擬非同步回調
  setTimeout(() => {
    mockCallback(platform_order_id, 'SUCCESS');
  }, 5000);
});

// 查詢訂單詳情
router.get('/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // 模擬訂單資料
  const orderData = {
    order_id: 'ORD_' + orderId,
    platform_order_id: orderId,
    amount: '100.00',
    currency: 'TWD',
    status: mockPayment(orderId), // 隨機返回狀態
    created_at: new Date().toISOString(),
    paid_at: new Date().toISOString()
  };

  res.json({
    code: 200,
    message: 'success',
    data: orderData
  });
});

// 模擬支付回調 (手動觸發測試)
router.post('/simulate-callback', (req, res) => {
  const { platform_order_id, status } = req.body;
  mockCallback(platform_order_id, status || 'SUCCESS');
  res.json({ code: 200, message: '回調已發送' });
});

module.exports = router;
