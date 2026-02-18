
/**
 * @fileoverview 退款訂單模型
 * @description 處理退款訂單資料庫操作，包括建立、查詢和更新退款訂單。
 */

const db = require("../config/db");

class RefundOrder {
  /**
   * 建立新的退款訂單
   * @param {object} refundData - 退款訂單資料
   * @returns {Promise<object>} 新建立的退款訂單資料
   */
  static async create(refundData) {
    const {
      refundSn,
      orderId,
      merchantId,
      currencyCode,
      amount,
      reason,
      channelRefundId,
    } = refundData;
    const res = await db.query(
      `INSERT INTO refund_orders (
        refund_sn, order_id, merchant_id, currency_code, amount, reason, channel_refund_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [refundSn, orderId, merchantId, currencyCode, amount, reason, channelRefundId]
    );
    return res.rows[0];
  }

  /**
   * 根據退款單號查詢退款訂單
   * @param {string} refundSn - 退款單號
   * @returns {Promise<object>} 退款訂單資料
   */
  static async findByRefundSn(refundSn) {
    const res = await db.query("SELECT * FROM refund_orders WHERE refund_sn = $1", [refundSn]);
    return res.rows[0];
  }

  /**
   * 根據 ID 查詢退款訂單
   * @param {number} id - 退款訂單 ID
   * @returns {Promise<object>} 退款訂單資料
   */
  static async findById(id) {
    const res = await db.query("SELECT * FROM refund_orders WHERE id = $1", [id]);
    return res.rows[0];
  }

  /**
   * 更新退款訂單狀態
   * @param {string} refundSn - 退款單號
   * @param {object} updateData - 欲更新的資料
   * @returns {Promise<object>} 更新後的退款訂單資料
   */
  static async update(refundSn, updateData) {
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const key in updateData) {
      setClauses.push(`${key} = $${i}`);
      values.push(updateData[key]);
      i++;
    }
    values.push(refundSn);
    const res = await db.query(
      `UPDATE refund_orders SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE refund_sn = $${i} RETURNING *`,
      values
    );
    return res.rows[0];
  }
}

module.exports = RefundOrder;
