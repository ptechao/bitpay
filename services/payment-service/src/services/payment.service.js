"""
/**
 * @fileoverview 支付服務
 * @description 處理支付相關的業務邏輯，包括建立支付訂單、查詢、處理回調、發起退款和查詢退款。
 */

const PaymentOrder = require("../models/paymentOrder.model");
const RefundOrder = require("../models/refundOrder.model");
const { generateQRCode, verifySignature } = require("../utils/payment.util");

class PaymentService {
  /**
   * 建立支付訂單
   * @param {object} paymentData - 支付資料
   * @returns {Promise<object>} 支付訂單資訊，可能包含 QR 碼資料
   */
  static async createPaymentOrder(paymentData) {
    const { merchantId, merchantOrderId, amount, currencyCode, paymentMethod, callbackUrl, mode } = paymentData;

    // 1. 選擇支付通道 (簡化邏輯，實際應根據商戶配置、金額、幣種等選擇)
    const channelId = 1; // 假設預設通道 ID 為 1

    // 2. 生成訂單號
    const orderSn = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 3. 建立支付訂單
    const newOrder = await PaymentOrder.create({
      orderSn,
      merchantId,
      merchantOrderId,
      channelId,
      currencyCode,
      amount,
      paymentMethod,
      callbackUrl,
      status: "pending",
    });

    let paymentInfo = { order: newOrder };

    // 4. 處理 QR 碼收銀台模式
    if (mode === "qr_code") {
      const qrCodeData = `https://payment.example.com/pay?orderSn=${orderSn}`;
      const qrCodeImage = await generateQRCode(qrCodeData);
      paymentInfo.qrCode = qrCodeImage; // 假設返回 base64 或 URL
    }

    // 5. 呼叫支付通道 API (此處為模擬)
    console.log(`呼叫通道 ${channelId} 支付 API，訂單號: ${orderSn}`);
    // 實際情況會在這裡發送請求到第三方支付通道

    return paymentInfo;
  }

  /**
   * 查詢支付訂單
   * @param {string} orderId - 支付訂單號
   * @returns {Promise<object>} 支付訂單資料
   */
  static async queryPaymentOrder(orderId) {
    const order = await PaymentOrder.findByOrderSn(orderId);
    if (!order) {
      throw new Error("支付訂單不存在");
    }
    return order;
  }

  /**
   * 處理支付通道回調
   * @param {object} callbackData - 回調資料
   * @param {string} signature - 簽名
   * @returns {Promise<object>} 處理結果
   */
  static async handlePaymentCallback(callbackData, signature) {
    // 1. 驗證簽名
    const isValid = verifySignature(callbackData, signature);
    if (!isValid) {
      throw new Error("簽名驗證失敗");
    }

    const { orderSn, status, channelTransactionId, actualAmount, fee } = callbackData;

    // 2. 查詢訂單
    const order = await PaymentOrder.findByOrderSn(orderSn);
    if (!order) {
      throw new Error("支付訂單不存在");
    }

    // 3. 更新訂單狀態
    const updatedOrder = await PaymentOrder.update(orderSn, {
      status: status === "success" ? "success" : "failed",
      channelTransactionId,
      actualAmount,
      fee,
      completedAt: new Date(),
    });

    // 4. 通知商戶 (實際應透過訊息佇列或 HTTP 請求)
    console.log(`通知商戶 ${order.merchantId} 支付結果: ${updatedOrder.status}`);

    return updatedOrder;
  }

  /**
   * 發起退款
   * @param {object} refundData - 退款資料
   * @returns {Promise<object>} 退款訂單資訊
   */
  static async createRefundOrder(refundData) {
    const { orderId, merchantId, amount, currencyCode, reason } = refundData;

    // 1. 查詢原支付訂單
    const originalOrder = await PaymentOrder.findByOrderSn(orderId);
    if (!originalOrder) {
      throw new Error("原支付訂單不存在");
    }
    if (originalOrder.status !== "success") {
      throw new Error("原支付訂單狀態不正確，無法退款");
    }
    if (amount > originalOrder.amount) {
      throw new Error("退款金額不能大於原支付金額");
    }

    // 2. 生成退款單號
    const refundSn = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 3. 建立退款訂單
    const newRefund = await RefundOrder.create({
      refundSn,
      orderId: originalOrder.id,
      merchantId,
      currencyCode,
      amount,
      reason,
      status: "pending",
    });

    // 4. 呼叫支付通道退款 API (此處為模擬)
    console.log(`呼叫通道 ${originalOrder.channelId} 退款 API，退款單號: ${refundSn}`);
    // 實際情況會在這裡發送請求到第三方支付通道

    return newRefund;
  }

  /**
   * 查詢退款訂單
   * @param {string} refundId - 退款單號
   * @returns {Promise<object>} 退款訂單資料
   */
  static async queryRefundOrder(refundId) {
    const refund = await RefundOrder.findByRefundSn(refundId);
    if (!refund) {
      throw new Error("退款訂單不存在");
    }
    return refund;
  }
}

module.exports = PaymentService;
"""
