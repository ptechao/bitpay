/**
 * 前言：此檔案為回調模擬工具，用於模擬支付通道向商戶發送支付結果通知。
 */

const mockCallback = (platform_order_id, status) => {
  const callbackData = {
    platform_order_id,
    status,
    amount: '100.00',
    currency: 'TWD',
    sign: 'E10ADC3949BA59ABBE56E057F20F883E'
  };

  console.log(`[Mock Callback] 發送回調通知至商戶: \${JSON.stringify(callbackData)}`);
  // 實際開發中，這裡會發送 HTTP POST 請求至商戶的 notify_url
  return callbackData;
};

module.exports = { mockCallback };
