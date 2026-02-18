// 檔案：src/models/settlementModel.js
// 說明：負責與結算相關的資料庫表進行互動，包括 settlements, withdrawals, agent_commission_records, payment_orders, merchants, agents。

const { query } = require("../config/db");

class SettlementModel {
  /**
   * 根據實體類型和 ID 查詢結算單
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @param {object} filters - 過濾條件 (例如：currencyCode, status, startDate, endDate)
   * @returns {Promise<Array<object>>} 結算單列表
   */
  static async getSettlements(entityType, entityId, filters = {}) {
    let queryString = `SELECT * FROM settlements WHERE entity_type = $1 AND entity_id = $2`;
    const values = [entityType, entityId];
    let paramIndex = 3;

    if (filters.currencyCode) {
      queryString += ` AND currency_code = $${paramIndex++}`;
      values.push(filters.currencyCode);
    }
    if (filters.status) {
      queryString += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters.startDate) {
      queryString += ` AND start_date >= $${paramIndex++}`;
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      queryString += ` AND end_date <= $${paramIndex++}`;
      values.push(filters.endDate);
    }

    queryString += ` ORDER BY created_at DESC`;

    const res = await query(queryString, values);
    return res.rows;
  }

  /**
   * 創建新的結算單
   * @param {object} settlementData - 結算單資料
   * @returns {Promise<object>} 新創建的結算單資訊
   */
  static async createSettlement(settlementData) {
    const { settlementSn, entityType, entityId, currencyCode, startDate, endDate, totalIncome, totalFee, totalRefund, netAmount, status } = settlementData;
    const res = await query(
      `INSERT INTO settlements (settlement_sn, entity_type, entity_id, currency_code, start_date, end_date, total_income, total_fee, total_refund, net_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [settlementSn, entityType, entityId, currencyCode, startDate, endDate, totalIncome, totalFee, totalRefund, netAmount, status]
    );
    return res.rows[0];
  }

  /**
   * 更新結算單狀態
   * @param {number} settlementId - 結算單 ID
   * @param {string} status - 新狀態
   * @returns {Promise<object|null>} 更新後的結算單資訊或 null
   */
  static async updateSettlementStatus(settlementId, status) {
    const res = await query(
      `UPDATE settlements SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, settlementId]
    );
    return res.rows[0] || null;
  }

  /**
   * 查詢待結算的支付訂單
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @param {Date} endDate - 結算截止日期
   * @returns {Promise<Array<object>>} 待結算的支付訂單列表
   */
  static async getPendingPaymentOrders(entityType, entityId, endDate) {
    let queryString = `
      SELECT po.* FROM payment_orders po
      WHERE po.status = 'success' AND po.completed_at <= $1
    `;
    const values = [endDate];
    let paramIndex = 2;

    if (entityType === 'merchant') {
      queryString += ` AND po.merchant_id = $${paramIndex++}`;
      values.push(entityId);
    } else if (entityType === 'agent') {
      // 查詢該代理及其下級代理和商戶的訂單
      queryString += `
        AND (po.merchant_id IN (SELECT id FROM merchants WHERE parent_agent_id = $${paramIndex})
             OR po.merchant_id IN (SELECT m.id FROM merchants m JOIN agents a ON m.parent_agent_id = a.id JOIN agent_hierarchy ah ON a.id = ah.descendant_id WHERE ah.ancestor_id = $${paramIndex} AND ah.depth > 0))
      `;
      values.push(entityId);
    }

    const res = await query(queryString, values);
    return res.rows;
  }

  /**
   * 查詢待結算的分潤記錄
   * @param {number} agentId - 代理 ID
   * @param {Date} endDate - 結算截止日期
   * @returns {Promise<Array<object>>} 待結算的分潤記錄列表
   */
  static async getPendingCommissionRecords(agentId, endDate) {
    const res = await query(
      `SELECT * FROM agent_commission_records WHERE agent_id = $1 AND status = 'pending' AND created_at <= $2`,
      [agentId, endDate]
    );
    return res.rows;
  }

  /**
   * 更新支付訂單的結算狀態
   * @param {Array<number>} orderIds - 支付訂單 ID 列表
   * @param {number} settlementId - 結算單 ID
   * @returns {Promise<void>}
   */
  static async updatePaymentOrdersSettlementStatus(orderIds, settlementId) {
    if (orderIds.length === 0) return;
    await query(
      `UPDATE payment_orders SET settlement_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::int[])`,
      [settlementId, orderIds]
    );
  }

  /**
   * 更新分潤記錄的結算狀態
   * @param {Array<number>} commissionIds - 分潤記錄 ID 列表
   * @param {number} settlementId - 結算單 ID
   * @returns {Promise<void>}
   */
  static async updateCommissionRecordsSettlementStatus(commissionIds, settlementId) {
    if (commissionIds.length === 0) return;
    await query(
      `UPDATE agent_commission_records SET status = 'settled', settlement_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2::int[])`,
      [settlementId, commissionIds]
    );
  }

  /**
   * 創建提現記錄
   * @param {object} withdrawalData - 提現資料
   * @returns {Promise<object>} 新創建的提現記錄
   */
  static async createWithdrawal(withdrawalData) {
    const { withdrawalSn, entityType, entityId, currencyCode, amount, fee, actualAmount, bankName, accountName, accountNumber, cryptoWalletAddress, status } = withdrawalData;
    const res = await query(
      `INSERT INTO withdrawals (withdrawal_sn, entity_type, entity_id, currency_code, amount, fee, actual_amount, bank_name, account_name, account_number, crypto_wallet_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [withdrawalSn, entityType, entityId, currencyCode, amount, fee, actualAmount, bankName, accountName, accountNumber, cryptoWalletAddress, status]
    );
    return res.rows[0];
  }

  /**
   * 根據 ID 查詢提現記錄
   * @param {number} withdrawalId - 提現記錄 ID
   * @returns {Promise<object|null>} 提現記錄或 null
   */
  static async getWithdrawalById(withdrawalId) {
    const res = await query("SELECT * FROM withdrawals WHERE id = $1", [withdrawalId]);
    return res.rows[0] || null;
  }

  /**
   * 查詢實體的提現記錄
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @param {object} filters - 過濾條件
   * @returns {Promise<Array<object>>} 提現記錄列表
   */
  static async getWithdrawalsByEntity(entityType, entityId, filters = {}) {
    let queryString = `SELECT * FROM withdrawals WHERE entity_type = $1 AND entity_id = $2`;
    const values = [entityType, entityId];
    let paramIndex = 3;

    if (filters.currencyCode) {
      queryString += ` AND currency_code = $${paramIndex++}`;
      values.push(filters.currencyCode);
    }
    if (filters.status) {
      queryString += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters.startDate) {
      queryString += ` AND created_at >= $${paramIndex++}`;
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      queryString += ` AND created_at <= $${paramIndex++}`;
      values.push(filters.endDate);
    }

    queryString += ` ORDER BY created_at DESC`;

    const res = await query(queryString, values);
    return res.rows;
  }

  /**
   * 查詢商戶資訊
   * @param {number} merchantId - 商戶 ID
   * @returns {Promise<object|null>} 商戶資訊或 null
   */
  static async getMerchantById(merchantId) {
    const res = await query("SELECT * FROM merchants WHERE id = $1", [merchantId]);
    return res.rows[0] || null;
  }

  /**
   * 查詢代理資訊
   * @param {number} agentId - 代理 ID
   * @returns {Promise<object|null>} 代理資訊或 null
   */
  static async getAgentById(agentId) {
    const res = await query("SELECT * FROM agents WHERE id = $1", [agentId]);
    return res.rows[0] || null;
  }

  /**
   * 獲取代理的所有下級代理 ID
   * @param {number} agentId - 代理 ID
   * @returns {Promise<Array<number>>} 下級代理 ID 列表
   */
  static async getDescendantAgentIds(agentId) {
    const res = await query(
      `SELECT descendant_id FROM agent_hierarchy WHERE ancestor_id = $1 AND depth > 0`,
      [agentId]
    );
    return res.rows.map(row => row.descendant_id);
  }

  /**
   * 獲取代理的所有下級商戶 ID
   * @param {number} agentId - 代理 ID
   * @returns {Promise<Array<number>>} 下級商戶 ID 列表
   */
  static async getDescendantMerchantIds(agentId) {
    const res = await query(
      `SELECT id FROM merchants WHERE parent_agent_id = $1`,
      [agentId]
    );
    return res.rows.map(row => row.id);
  }

  /**
   * 獲取指定時間範圍內，屬於特定商戶或其下級代理/商戶的支付訂單
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Array<object>>} 支付訂單列表
   */
  static async getPaymentOrdersForSettlement(entityType, entityId, startDate, endDate) {
    let merchantIds = [];
    if (entityType === 'merchant') {
      merchantIds.push(entityId);
    } else if (entityType === 'agent') {
      // 獲取該代理直接下級商戶
      const directMerchantIds = await this.getDescendantMerchantIds(entityId);
      merchantIds = merchantIds.concat(directMerchantIds);

      // 獲取該代理所有下級代理的商戶
      const descendantAgentIds = await this.getDescendantAgentIds(entityId);
      for (const subAgentId of descendantAgentIds) {
        const subAgentMerchants = await this.getDescendantMerchantIds(subAgentId);
        merchantIds = merchantIds.concat(subAgentMerchants);
      }
    }

    if (merchantIds.length === 0) {
      return [];
    }

    const res = await query(
      `SELECT * FROM payment_orders
       WHERE merchant_id = ANY($1::int[])
       AND status = 'success'
       AND completed_at >= $2 AND completed_at <= $3`,
      [merchantIds, startDate, endDate]
    );
    return res.rows;
  }

  /**
   * 獲取指定時間範圍內，屬於特定代理的分潤記錄
   * @param {number} agentId - 代理 ID
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Array<object>>} 分潤記錄列表
   */
  static async getCommissionRecordsForSettlement(agentId, startDate, endDate) {
    const res = await query(
      `SELECT * FROM agent_commission_records
       WHERE agent_id = $1
       AND status = 'pending'
       AND created_at >= $2 AND created_at <= $3`,
      [agentId, startDate, endDate]
    );
    return res.rows;
  }

  /**
   * 獲取實體的結算配置 (例如結算週期)
   * 這裡假設商戶和代理的結算週期配置儲存在各自的表中，或者有一個統一的配置表
   * 為了簡化，目前先返回一個預設值，實際應從資料庫中獲取
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @returns {Promise<object>} 結算配置，例如 { settlementCycle: 'D+1' }
   */
  static async getEntitySettlementConfig(entityType, entityId) {
    // 實際應用中，這裡會從 merchants 或 agents 表中查詢 settlement_cycle 欄位
    // 或者從一個專門的 settlement_configs 表中查詢
    // 為了演示，先返回一個硬編碼的預設值
    return { settlementCycle: 'D+1' }; // 預設 D+1 結算
  }

  /**
   * 根據 settlement_sn 查詢結算單
   * @param {string} settlementSn - 結算單編號
   * @returns {Promise<object|null>} 結算單資訊或 null
   */
  static async getSettlementBySn(settlementSn) {
    const res = await query("SELECT * FROM settlements WHERE settlement_sn = $1", [settlementSn]);
    return res.rows[0] || null;
  }

  /**
   * 根據 withdrawal_sn 查詢提現記錄
   * @param {string} withdrawalSn - 提現單編號
   * @returns {Promise<object|null>} 提現記錄或 null
   */
  static async getWithdrawalBySn(withdrawalSn) {
    const res = await query("SELECT * FROM withdrawals WHERE withdrawal_sn = $1", [withdrawalSn]);
    return res.rows[0] || null;
  }
}

module.exports = SettlementModel;
