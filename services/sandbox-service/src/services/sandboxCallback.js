
/**
 * @file services/sandbox-service/src/services/sandboxCallback.js
 * @description 聚合支付平台沙盒服務的回調模擬邏輯。
 *              負責向商戶的通知 URL 發送支付結果回調。
 * @author Manus AI
 * @date 2026-02-19
 */

const axios = require('axios');

/**
 * 向商戶的通知 URL 發送回調。
 * @param {object} order - 訂單物件，包含 notifyUrl 和支付結果。
 * @returns {Promise<object>} 回調結果，包含狀態碼和響應數據。
 */
exports.sendCallback = async (order) => {
  if (!order || !order.notifyUrl) {
    console.error('回調失敗: 缺少訂單或通知 URL');
    return { success: false, message: '缺少訂單或通知 URL' };
  }

  try {
    console.log(`向 ${order.notifyUrl} 發送回調，訂單 ID: ${order.id}, 狀態: ${order.status}`);
    const response = await axios.post(order.notifyUrl, {
      orderId: order.id,
      merchantId: order.merchantId,
      orderRef: order.orderRef,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      paymentTime: order.paymentTime,
      // 可以在這裡添加簽名等安全參數
    });

    console.log(`回調成功，狀態碼: ${response.status}, 響應: ${JSON.stringify(response.data)}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.error(`回調失敗，訂單 ID: ${order.id}, 錯誤: ${error.message}`);
    return { success: false, message: error.message };
  }
};
