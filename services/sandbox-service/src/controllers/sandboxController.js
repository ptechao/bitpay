
/**
 * @file services/sandbox-service/src/controllers/sandboxController.js
 * @description 聚合支付平台沙盒服務的控制器，處理沙盒環境的 API 請求。
 *              包含訂單創建、支付模擬、回調處理等邏輯。
 * @author Manus AI
 * @date 2026-02-19
 */

const sandboxPayment = require("../services/sandboxPayment");
const sandboxCallback = require("../services/sandboxCallback");
const sandboxModel = require("../models/sandboxModel");

exports.createOrder = async (req, res) => {
  const { merchantId, amount, currency, orderRef, notifyUrl } = req.body;

  if (!merchantId || !amount || !currency || !orderRef || !notifyUrl) {
    return res.status(400).json({ code: '400', message: '缺少必要的參數' });
  }

  try {
    const order = await sandboxModel.createSandboxOrder({
      merchantId,
      amount,
      currency,
      orderRef,
      notifyUrl,
      status: 'PENDING',
    });
    res.status(200).json({ code: '200', message: '訂單創建成功', data: order });
  } catch (error) {
    console.error('創建沙盒訂單失敗:', error);
    res.status(500).json({ code: '500', message: '內部伺服器錯誤' });
  }
};

exports.simulatePayment = async (req, res) => {
  const { orderId, paymentStatus } = req.body;

  if (!orderId || !paymentStatus) {
    return res.status(400).json({ code: '400', message: '缺少必要的參數' });
  }

  try {
    const order = await sandboxModel.getSandboxOrderById(orderId);
    if (!order) {
      return res.status(404).json({ code: '404', message: '訂單不存在' });
    }

    const result = await sandboxPayment.simulatePayment(order, paymentStatus);
    res.status(200).json({ code: '200', message: '支付模擬請求已處理', data: result });
  } catch (error) {
    console.error('模擬支付失敗:', error);
    res.status(500).json({ code: '500', message: '內部伺服器錯誤' });
  }
};

exports.getSandboxOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await sandboxModel.getSandboxOrderById(orderId);
    if (!order) {
      return res.status(404).json({ code: '404', message: '訂單不存在' });
    }
    res.status(200).json({ code: '200', message: '訂單查詢成功', data: order });
  } catch (error) {
    console.error('查詢沙盒訂單失敗:', error);
    res.status(500).json({ code: '500', message: '內部伺服器錯誤' });
  }
};
