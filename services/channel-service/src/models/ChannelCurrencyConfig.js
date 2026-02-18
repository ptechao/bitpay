// src/models/ChannelCurrencyConfig.js
/**
 * @file 通道幣種配置模型
 * @description 定義通道支援幣種的資料庫操作。
 * @author Manus AI
 */

const BaseModel = require("./baseModel");

class ChannelCurrencyConfig extends BaseModel {
  constructor() {
    super("channel_currencies");
  }

  /**
   * 根據 channel_id 查詢所有幣種配置。
   * @param {number} channelId - 支付通道 ID
   * @returns {Promise<Array<object>>} 幣種配置陣列
   */
  async findByChannelId(channelId) {
    return this.findBy({ channel_id: channelId });
  }

  /**
   * 根據 channel_id 和 currency_code 查詢單一幣種配置。
   * @param {number} channelId - 支付通道 ID
   * @param {string} currencyCode - 幣種代碼
   * @returns {Promise<object|null>} 幣種配置或 null
   */
  async findByChannelIdAndCurrencyCode(channelId, currencyCode) {
    const query = `SELECT * FROM ${this.tableName} WHERE channel_id = $1 AND currency_code = $2`;
    const { rows } = await this.pool.query(query, [channelId, currencyCode]);
    return rows[0] || null;
  }

  /**
   * 更新或創建通道幣種配置。
   * @param {number} channelId - 支付通道 ID
   * @param {string} currencyCode - 幣種代碼
   * @param {object} data - 要更新或創建的資料
   * @returns {Promise<object>} 更新或創建後的幣種配置
   */
  async upsert(channelId, currencyCode, data) {
    const existingConfig = await this.findByChannelIdAndCurrencyCode(channelId, currencyCode);
    if (existingConfig) {
      return this.update(existingConfig.id, data);
    } else {
      return this.create({ channel_id: channelId, currency_code: currencyCode, ...data });
    }
  }
}

module.exports = new ChannelCurrencyConfig();
