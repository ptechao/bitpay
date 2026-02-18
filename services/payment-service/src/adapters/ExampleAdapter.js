/**
 * 前言：此檔案為範例 Adapter，展示如何實作一個具體的支付通道對接。
 * 繼承自 BaseAdapter 並實作所有統一介面。
 */

const BaseAdapter = require('./BaseAdapter');
const axios = require('axios'); // 假設使用 axios 進行 HTTP 請求
const crypto = require('crypto');

class ExampleAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.gatewayUrl = config.gatewayUrl || 'https://api.example-pay.com/v1';
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  /**
   * 實作建立支付訂單
   */
  async createOrder(orderData) {
    const params = {
      mch_id: this.apiKey,
      out_trade_no: orderData.platformOrderId,
      total_fee: Math.round(orderData.amount * 100), // 轉換為分
      body: orderData.subject,
      notify_url: orderData.notifyUrl,
      nonce_str: crypto.randomBytes(16).toString('hex'),
    };

    params.sign = this._generateSign(params);

    try {
      // 模擬發送請求至通道 API
      // const response = await axios.post(`${this.gatewayUrl}/pay`, params);
      const response = { data: { code: 'SUCCESS', pay_url: 'https://pay.example.com/checkout/123' } };

      if (response.data.code === 'SUCCESS') {
        return {
          success: true,
          payUrl: response.data.pay_url,
          channelOrderId: 'CH_' + Date.now(),
          raw: response.data
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * 實作查詢訂單狀態
   */
  async queryOrder(platformOrderId) {
    // 模擬查詢邏輯
    return {
      success: true,
      status: 'PAID', // 統一狀態碼：PAID, PENDING, FAILED, REFUNDED
      amount: '100.00',
      paidAt: new Date().toISOString()
    };
  }

  /**
   * 實作申請退款
   */
  async refund(refundData) {
    // 模擬退款邏輯
    return {
      success: true,
      refundId: 'REF_' + Date.now(),
      status: 'SUCCESS'
    };
  }

  /**
   * 實作驗證回調簽名
   */
  verifyCallback(rawData) {
    const { sign, ...params } = rawData;
    const expectedSign = this._generateSign(params);

    if (sign === expectedSign) {
      return {
        isValid: true,
        platformOrderId: rawData.out_trade_no,
        status: rawData.status === 'SUCCESS' ? 'PAID' : 'FAILED',
        amount: (rawData.total_fee / 100).toFixed(2)
      };
    }
    return { isValid: false };
  }

  /**
   * 內部工具：生成簽名
   */
  _generateSign(params) {
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.apiSecret}`;
    
    return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
  }
}

module.exports = ExampleAdapter;
