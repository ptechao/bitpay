
/**
 * @fileoverview 商戶模型
 * @description 處理商戶資料庫操作，包括商戶註冊、查詢、更新及配置支付參數和結算週期。
 */

const db = require("../config/db");

class Merchant {
  /**
   * 建立新商戶
   * @param {object} merchantData - 商戶資料
   * @returns {Promise<object>} 新建立的商戶資料
   */
  static async create(merchantData) {
    const { userId, name, legalName, contactPerson, contactEmail, phoneNumber, address, website, parentAgentId } = merchantData;
    const res = await db.query(
      `INSERT INTO merchants (user_id, name, legal_name, contact_person, contact_email, phone_number, address, website, parent_agent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, name, legalName, contactPerson, contactEmail, phoneNumber, address, website, parentAgentId]
    );
    return res.rows[0];
  }

  /**
   * 根據 ID 查詢商戶
   * @param {number} id - 商戶 ID
   * @returns {Promise<object>} 商戶資料
   */
  static async findById(id) {
    const res = await db.query("SELECT * FROM merchants WHERE id = $1", [id]);
    return res.rows[0];
  }

  /**
   * 根據 user_id 查詢商戶
   * @param {number} userId - 使用者 ID
   * @returns {Promise<object>} 商戶資料
   */
  static async findByUserId(userId) {
    const res = await db.query("SELECT * FROM merchants WHERE user_id = $1", [userId]);
    return res.rows[0];
  }

  /**
   * 更新商戶資料
   * @param {number} id - 商戶 ID
   * @param {object} updateData - 欲更新的資料
   * @returns {Promise<object>} 更新後的商戶資料
   */
  static async update(id, updateData) {
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const key in updateData) {
      setClauses.push(`${key} = $${i}`);
      values.push(updateData[key]);
      i++;
    }
    values.push(id);
    const res = await db.query(
      `UPDATE merchants SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`,
      values
    );
    return res.rows[0];
  }

  /**
   * 配置商戶支付參數
   * @param {object} configData - 支付配置資料
   * @returns {Promise<object>} 配置資料
   */
  static async configurePayment(configData) {
    const { merchantId, channelId, currencyCode, isEnabled, feeRate, fixedFee, minAmount, maxAmount } = configData;
    const res = await db.query(
      `INSERT INTO merchant_channel_configs (merchant_id, channel_id, currency_code, is_enabled, fee_rate, fixed_fee, min_amount, max_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (merchant_id, channel_id, currency_code) DO UPDATE
       SET is_enabled = EXCLUDED.is_enabled, fee_rate = EXCLUDED.fee_rate, fixed_fee = EXCLUDED.fixed_fee, min_amount = EXCLUDED.min_amount, max_amount = EXCLUDED.max_amount, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [merchantId, channelId, currencyCode, isEnabled, feeRate, fixedFee, minAmount, maxAmount]
    );
    return res.rows[0];
  }

  /**
   * 查詢商戶交易記錄
   * @param {number} merchantId - 商戶 ID
   * @param {object} filters - 過濾條件 (e.g., status, currencyCode, startDate, endDate)
   * @returns {Promise<Array<object>>} 交易記錄列表
   */
  static async getTransactions(merchantId, filters = {}) {
    let query = `SELECT * FROM payment_orders WHERE merchant_id = $1`;
    const values = [merchantId];
    let i = 2;

    if (filters.status) {
      query += ` AND status = $${i}`;
      values.push(filters.status);
      i++;
    }
    if (filters.currencyCode) {
      query += ` AND currency_code = $${i}`;
      values.push(filters.currencyCode);
      i++;
    }
    if (filters.startDate) {
      query += ` AND created_at >= $${i}`;
      values.push(filters.startDate);
      i++;
    }
    if (filters.endDate) {
      query += ` AND created_at <= $${i}`;
      values.push(filters.endDate);
      i++;
    }

    query += ` ORDER BY created_at DESC`;

    const res = await db.query(query, values);
    return res.rows;
  }

  /**
   * 設定商戶結算週期
   * @param {object} settlementConfigData - 結算配置資料
   * @returns {Promise<object>} 配置資料
   */
  static async setSettlementConfig(settlementConfigData) {
    const { merchantId, settlementCycle, currencyCode, settlementAccount } = settlementConfigData;
    // 這裡假設有一個 merchant_settlement_configs 表來儲存結算配置
    // 如果沒有，需要先在 schema.sql 中新增此表
    const res = await db.query(
      `INSERT INTO merchant_settlement_configs (merchant_id, settlement_cycle, currency_code, settlement_account)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (merchant_id, currency_code) DO UPDATE
       SET settlement_cycle = EXCLUDED.settlement_cycle, settlement_account = EXCLUDED.settlement_account, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [merchantId, settlementCycle, currencyCode, settlementAccount]
    );
    return res.rows[0];
  }
}

module.exports = Merchant;
