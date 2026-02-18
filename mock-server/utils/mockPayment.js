/**
 * 前言：此檔案為支付模擬工具，用於隨機生成支付狀態，模擬支付成功、失敗、超時等場景。
 */

const mockPayment = (orderId) => {
  const statuses = ['SUCCESS', 'FAILED', 'PENDING', 'TIMEOUT'];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

module.exports = { mockPayment };
