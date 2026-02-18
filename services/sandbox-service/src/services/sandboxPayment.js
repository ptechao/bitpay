
/**
 * @file services/sandbox-service/src/services/sandboxPayment.js
 * @description 聚合支付平台沙盒服務的支付模擬邏輯。
 *              根據指定的支付狀態模擬成功、失敗或超時，並更新訂單狀態。
 * @author Manus AI
 * @date 2026-02-19
 */

const sandboxModel = require("../models/sandboxModel");
const sandboxCallback = require("./sandboxCallback");

const PAYMENT_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  TIMEOUT: "TIMEOUT",
};

/**
 * 模擬支付過程，並根據結果更新訂單狀態及觸發回調。
 * @param {object} order - 訂單物件。
 * @param {string} paymentStatus - 模擬的支付狀態 (SUCCESS, FAILED, TIMEOUT)。
 * @returns {Promise<object>} 包含模擬結果的物件。
 */
exports.simulatePayment = async (order, paymentStatus) => {
  let updatedOrder;
  let callbackResult;

  switch (paymentStatus) {
    case PAYMENT_STATUS.SUCCESS:
      updatedOrder = await sandboxModel.updateSandboxOrder(order.id, { status: PAYMENT_STATUS.SUCCESS, paymentTime: new Date() });
      callbackResult = await sandboxCallback.sendCallback(updatedOrder);
      return { status: PAYMENT_STATUS.SUCCESS, order: updatedOrder, callback: callbackResult };

    case PAYMENT_STATUS.FAILED:
      updatedOrder = await sandboxModel.updateSandboxOrder(order.id, { status: PAYMENT_STATUS.FAILED, paymentTime: new Date() });
      callbackResult = await sandboxCallback.sendCallback(updatedOrder);
      return { status: PAYMENT_STATUS.FAILED, order: updatedOrder, callback: callbackResult };

    case PAYMENT_STATUS.TIMEOUT:
      // 模擬超時，不立即更新狀態，等待回調服務處理
      // 實際情況中，超時可能由外部系統觸發，這裡僅模擬不立即響應
      return { status: PAYMENT_STATUS.TIMEOUT, message: "支付超時模擬，等待回調通知" };

    default:
      throw new Error("無效的支付狀態");
  }
};
