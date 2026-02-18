
/**
 * @file tests/load/k6-settlement.js
 * @description 聚合支付平台結算流程的壓力測試腳本。
 *              模擬大量結算請求，測試結算服務的性能和穩定性。
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
    { duration: '1m', target: 10 },  // 1 分鐘內逐漸增加到 10 個虛擬用戶
    { duration: '3m', target: 30 },  // 3 分鐘內逐漸增加到 30 個虛擬用戶
    { duration: '5m', target: 30 },  // 保持 30 個虛擬用戶 5 分鐘
    { duration: '1m', target: 0 },   // 1 分鐘內逐漸減少到 0 個虛擬用戶
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // 失敗請求率低於 1%
    http_req_duration: ['p(95)<800'], // 95% 的請求應在 800ms 內完成 (結算可能較重)
  },
};

// 測試數據 (可以從外部文件加載)
const merchants = new SharedArray('merchants', function () {
  return JSON.parse(open('../../scripts/test-data/merchants.json')).merchants;
});

// 假設我們有一些預先存在的交易數據用於結算
// 在實際場景中，這些數據可能來自於數據庫或消息隊列
const transactions = new SharedArray('transactions', function () {
  // 這裡應該加載或生成一些有效的交易數據
  // 為了演示，我們使用一些模擬數據
  return [
    { id: uuidv4(), merchantId: 'merchant_test_001', amount: 1000, commission: 10, refundAmount: 0 },
    { id: uuidv4(), merchantId: 'merchant_test_001', amount: 500, commission: 5, refundAmount: 20 },
    { id: uuidv4(), merchantId: 'merchant_test_002', amount: 2000, commission: 20, refundAmount: 0 },
    { id: uuidv4(), merchantId: 'merchant_test_003', amount: 150, commission: 1.5, refundAmount: 0 },
  ];
});

export default function () {
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const merchantTransactions = transactions.filter(tx => tx.merchantId === merchant.id);

  // 模擬結算請求
  // 假設有一個結算服務的 API 端點，接收商戶 ID 和交易列表
  const settlementPayload = {
    merchantId: merchant.id,
    transactions: merchantTransactions,
    settlementDate: new Date().toISOString().split('T')[0], // 當前日期
  };

  const settlementRes = http.post('http://localhost:3006/api/report/settlement', JSON.stringify(settlementPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Calculate Settlement' },
  });

  check(settlementRes, {
    'Calculate Settlement: is status 200': (r) => r.status === 200,
    'Calculate Settlement: is code 200': (r) => r.json().code === '200',
    'Calculate Settlement: has final settlement amount': (r) => r.json().data && typeof r.json().data.finalSettlement === 'number',
  });

  sleep(1);
}
