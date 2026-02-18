
/**
 * @file tests/load/k6-query.js
 * @description 聚合支付平台查詢流程的壓力測試腳本。
 *              模擬大量用戶查詢訂單、商戶資訊等場景。
 * @author Manus AI
 * @date 2026-02-19
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// 測試配置
export const options = {
  stages: [
    { duration: '1m', target: 20 },  // 1 分鐘內逐漸增加到 20 個虛擬用戶
    { duration: '3m', target: 50 },  // 3 分鐘內逐漸增加到 50 個虛擬用戶
    { duration: '5m', target: 50 },  // 保持 50 個虛擬用戶 5 分鐘
    { duration: '1m', target: 0 },   // 1 分鐘內逐漸減少到 0 個虛擬用戶
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // 失敗請求率低於 1%
    http_req_duration: ['p(95)<300'], // 95% 的請求應在 300ms 內完成
  },
};

// 測試數據 (可以從外部文件加載)
const merchants = new SharedArray('merchants', function () {
  return JSON.parse(open('../../scripts/test-data/merchants.json')).merchants;
});

// 假設我們有一些預先存在的訂單 ID 用於查詢
// 在實際場景中，這些 ID 可能來自於 setup 階段創建的數據
const existingOrderIds = new SharedArray('orderIds', function () {
  // 這裡應該加載或生成一些有效的訂單 ID
  // 為了演示，我們使用一些模擬 ID
  return [
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
  ];
});

export default function () {
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const randomOrderId = existingOrderIds[Math.floor(Math.random() * existingOrderIds.length)];

  // 1. 查詢沙盒訂單
  const sandboxOrderRes = http.get(`http://localhost:3001/api/sandbox/orders/${randomOrderId}`, {
    tags: { name: 'Query Sandbox Order' },
  });
  check(sandboxOrderRes, {
    'Query Sandbox Order: is status 200 or 404': (r) => r.status === 200 || r.status === 404, // 允許訂單不存在
  });

  // 2. 查詢商戶資訊 (假設有商戶服務)
  const merchantInfoRes = http.get(`http://localhost:3004/api/merchant/${merchant.id}`, {
    tags: { name: 'Query Merchant Info' },
  });
  check(merchantInfoRes, {
    'Query Merchant Info: is status 200': (r) => r.status === 200,
  });

  // 3. 查詢支付服務狀態 (假設有支付服務)
  const paymentServiceHealthRes = http.get('http://localhost:3002/api/payment/health', {
    tags: { name: 'Query Payment Service Health' },
  });
  check(paymentServiceHealthRes, {
    'Query Payment Service Health: is status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
