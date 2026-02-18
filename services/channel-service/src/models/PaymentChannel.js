// src/models/PaymentChannel.js
/**
 * @file 支付通道模型
 * @description 定義支付通道的資料庫操作。
 * @author Manus AI
 */

const BaseModel = require("./baseModel");

class PaymentChannel extends BaseModel {
  constructor() {
    super("payment_channels");
  }

  /**
   * 根據通道 ID 查詢通道詳情，包括其支援的幣種。
   * @param {number} channelId - 通道 ID
   * @returns {Promise<object|null>} 通道詳情或 null
   */
  async findChannelDetails(channelId) {
    const query = `
      SELECT
        pc.*,
        json_agg(cc.*) AS currencies
      FROM
        payment_channels pc
      LEFT JOIN
        channel_currencies cc ON pc.id = cc.channel_id
      WHERE
        pc.id = $1
      GROUP BY
        pc.id
    `;
    const { rows } = await this.pool.query(query, [channelId]);
    return rows[0] || null;
  }

  /**
   * 查詢所有通道及其支援的幣種。
   * @returns {Promise<Array<object>>} 所有通道的陣列
   */
  async findAllWithCurrencies() {
    const query = `
      SELECT
        pc.*,
        json_agg(cc.*) AS currencies
      FROM
        payment_channels pc
      LEFT JOIN
        channel_currencies cc ON pc.id = cc.channel_id
      GROUP BY
        pc.id
      ORDER BY
        pc.id
    `;
    const { rows } = await this.pool.query(query);
    return rows;
  }
}

module.exports = new PaymentChannel();
