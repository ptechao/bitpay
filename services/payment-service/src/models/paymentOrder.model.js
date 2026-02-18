
/**
 * @fileoverview 支付訂單模型
 * @description 處理支付訂單資料庫操作，包括建立、查詢和更新支付訂單。
 */

const db = require("../config/db");

class PaymentOrder {
  /**
   * 建立新的支付訂單
   * @param {object} orderData - 支付訂單資料
   * @returns {Promise<object>} 新建立的支付訂單資料
   */
  static async create(orderData) {
    const {
      orderSn,
      merchantId,
      merchantOrderId,
      channelId,
      currencyCode,
      amount,
      paymentMethod,
      callbackUrl,
    } = orderData;
    const res = await db.query(
      `INSERT INTO payment_orders (
        order_sn, merchant_id, merchant_order_id, channel_id, currency_code, amount, payment_method, callback_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [orderSn, merchantId, merchantOrderId, channelId, currencyCode, amount, paymentMethod, callbackUrl]
    );
    return res.rows[0];
  }

  /**
   * 根據訂單號查詢支付訂單
   * @param {string} orderSn - 支付訂單號
   * @returns {Promise<object>} 支付訂單資料
   */
  static async findByOrderSn(orderSn) {
    const res = await db.query("SELECT * FROM payment_orders WHERE order_sn = $1", [orderSn]);
    return res.rows[0];
  }

  /**
   * 根據 ID 查詢支付訂單
   * @param {number} id - 支付訂單 ID
   * @returns {Promise<object>} 支付訂單資料
   */
  static async findById(id) {
    const res = await db.query("SELECT * FROM payment_orders WHERE id = $1", [id]);
    return res.rows[0];
  }

  /**
   * 更新支付訂單狀態
   * @param {string} orderSn - 支付訂單號
   * @param {object} updateData - 欲更新的資料
   * @returns {Promise<object>} 更新後的支付訂單資料
   */
  static async update(orderSn, updateData) {
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const key in updateData) {
      setClauses.push(`${key} = $${i}`);
      values.push(updateData[key]);
      i++;
    }
    values.push(orderSn);
    const res = await db.query(
      `UPDATE payment_orders SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE order_sn = $${i} RETURNING *`,
      values
    );
    return res.rows[0];
  }
}

module.exports = PaymentOrder;
