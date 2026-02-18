// 前言：此檔案定義了 Payment 微服務的控制器邏輯。
// 包含了處理支付交易相關請求的方法，例如獲取所有支付和創建支付。

const PaymentModel = require("../models/paymentModel");

const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.findAll();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error getting all payments:", error);
    res.status(500).json({ message: "獲取支付交易失敗", error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const newPayment = await PaymentModel.create(req.body);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "創建支付交易失敗", error: error.message });
  }
};

module.exports = {
  getAllPayments,
  createPayment,
};
