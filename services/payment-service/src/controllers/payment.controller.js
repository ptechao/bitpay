
/**
 * @fileoverview 支付控制器
 * @description 處理支付相關的 HTTP 請求，並呼叫對應的業務邏輯服務。
 */

const PaymentService = require("../services/payment.service");

class PaymentController {
  /**
   * 建立支付訂單
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async createPayment(req, res, next) {
    try {
      const paymentData = req.body;
      const result = await PaymentService.createPaymentOrder(paymentData);
      res.status(201).json({ message: "支付訂單建立成功", data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢支付訂單
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async queryPayment(req, res, next) {
    try {
      const { orderId } = req.params;
      const order = await PaymentService.queryPaymentOrder(orderId);
      res.status(200).json({ message: "支付訂單查詢成功", data: order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 接收支付通道回調
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async handleCallback(req, res, next) {
    try {
      const callbackData = req.body;
      const signature = req.headers["x-signature"]; // 假設簽名在 header 中
      const result = await PaymentService.handlePaymentCallback(callbackData, signature);
      res.status(200).json({ message: "支付回調處理成功", data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 發起退款
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async createRefund(req, res, next) {
    try {
      const refundData = req.body;
      const result = await PaymentService.createRefundOrder(refundData);
      res.status(201).json({ message: "退款訂單建立成功", data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢退款
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async queryRefund(req, res, next) {
    try {
      const { refundId } = req.params;
      const refund = await PaymentService.queryRefundOrder(refundId);
      res.status(200).json({ message: "退款訂單查詢成功", data: refund });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
