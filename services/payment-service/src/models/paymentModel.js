// services/payment-service/src/models/paymentModel.js
// 前言：此檔案定義了支付相關的資料庫操作模型，使用 Supabase 客戶端進行查詢。

const supabase = require('../config/supabase');

const TABLE_NAME = 'payment_orders';

const PaymentModel = {
  async createPaymentOrder(orderData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([orderData])
      .select();

    if (error) {
      console.error('Error creating payment order:', error);
      throw new Error(error.message);
    }
    return data[0];
  },

  async getPaymentOrderById(orderId) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching payment order by ID:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async updatePaymentOrderStatus(orderId, status, channelTransactionId = null) {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (channelTransactionId) {
      updateData.channel_transaction_id = channelTransactionId;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating payment order status:', error);
      throw new Error(error.message);
    }
    return data[0];
  },

  // 更多支付相關的資料庫操作可以依此模式添加
};

module.exports = PaymentModel;
