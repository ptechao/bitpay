/**
 * 前言：此檔案為支付通道 Adapter 的基礎類別，定義了所有通道必須實作的統一介面。
 * 採用 Adapter Pattern 確保系統能以標準化方式對接不同的支付通道。
 */

class BaseAdapter {
  constructor(config) {
    this.config = config; // 通道配置資訊（如 API Key, Secret, Gateway URL）
  }

  /**
   * 建立支付訂單
   * @param {Object} orderData - 訂單資料
   * @returns {Promise<Object>} - 統一格式的支付回應
   */
  async createOrder(orderData) {
    throw new Error('Method createOrder() must be implemented');
  }

  /**
   * 查詢訂單狀態
   * @param {string} platformOrderId - 平台訂單號
   * @returns {Promise<Object>} - 統一格式的訂單狀態
   */
  async queryOrder(platformOrderId) {
    throw new Error('Method queryOrder() must be implemented');
  }

  /**
   * 申請退款
   * @param {Object} refundData - 退款資料
   * @returns {Promise<Object>} - 統一格式的退款回應
   */
  async refund(refundData) {
    throw new Error('Method refund() must be implemented');
  }

  /**
   * 驗證回調簽名並解析資料
   * @param {Object} rawData - 通道傳送的原始回調資料
   * @returns {Object} - 統一格式的解析結果
   */
  verifyCallback(rawData) {
    throw new Error('Method verifyCallback() must be implemented');
  }
}

module.exports = BaseAdapter;
