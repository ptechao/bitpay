
/**
 * @file tests/load/k6-payment.js
 * @description 聚合支付平台支付流程的壓力測試腳本。
 *              模擬大量用戶創建訂單和模擬支付的場景。
 * @author Manus AI
 * @date 2026-02-19
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// 測試配置
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // 1 分鐘內逐漸增加到 50 個虛擬用戶
    { duration: '3m', target: 100 }, // 3 分鐘內逐漸增加到 100 個虛擬用戶
    { duration: '5m', target: 100 }, // 保持 100 個虛擬用戶 5 分鐘
    { duration: '1m', target: 0 },   // 1 分鐘內逐漸減少到 0 個虛擬用戶
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // 失敗請求率低於 1%
    http_req_duration: ['p(95)<500'], // 95% 的請求應在 500ms 內完成
  },
};

// 測試數據 (可以從外部文件加載)
const merchants = new SharedArray('merchants', function () {
  return JSON.parse(open('../../scripts/test-data/merchants.json')).merchants;
});

export default function () {
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const orderRef = `K6_ORDER_${uuidv4()}`;
  const notifyUrl = `http://localhost:3000/api/merchant/callback`; // 模擬商戶回調地址

  // 1. 創建訂單
  const createOrderPayload = {
    merchantId: merchant.id,
    amount: Math.floor(Math.random() * 1000) + 100, // 100 到 1100 之間的隨機金額
    currency: 'TWD',
    orderRef: orderRef,
    notifyUrl: notifyUrl,
  };
  const createOrderRes = http.post('http://localhost:3001/api/sandbox/orders', JSON.stringify(createOrderPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Create Order' },
  });

  check(createOrderRes, {
    'Create Order: is status 200': (r) => r.status === 200,
    'Create Order: is code 200': (r) => r.json().code === '200',
    'Create Order: has order id': (r) => r.json().data && r.json().data.id !== undefined,
  });

  if (createOrderRes.status === 200 && createOrderRes.json().data) {
    const orderId = createOrderRes.json().data.id;

    // 2. 模擬支付
    const paymentStatus = Math.random() < 0.9 ? 'SUCCESS' : 'FAILED'; // 90% 成功，10% 失敗
    const simulatePaymentPayload = {
      orderId: orderId,
      paymentStatus: paymentStatus,
    };
    const simulatePaymentRes = http.post('http://localhost:3001/api/sandbox/payments/simulate', JSON.stringify(simulatePaymentPayload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Simulate Payment' },
    });

    check(simulatePaymentRes, {
      'Simulate Payment: is status 200': (r) => r.status === 200,
      'Simulate Payment: is code 200': (r) => r.json().code === '200',
    });

    // 3. 查詢訂單狀態 (驗證回調是否生效)
    sleep(1); // 等待回調處理
    const getOrderRes = http.get(`http://localhost:3001/api/sandbox/orders/${orderId}`, {
      tags: { name: 'Get Order Status' },
    });

    check(getOrderRes, {
      'Get Order Status: is status 200': (r) => r.status === 200,
      'Get Order Status: is code 200': (r) => r.json().code === '200',
      'Get Order Status: status matches simulated': (r) => r.json().data.status === paymentStatus,
    });
  }

  sleep(1);
}
