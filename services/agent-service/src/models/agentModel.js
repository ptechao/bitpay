// 檔案：src/models/agentModel.js
// 說明：負責與代理相關的資料庫表進行互動，包括 agents, agent_hierarchy, users, merchants, agent_commission_records。

const { query } = require("../config/db");

class AgentModel {
  /**
   * 根據使用者 ID 查詢代理資訊
   * @param {number} userId - 使用者 ID
   * @returns {Promise<object|null>} 代理資訊物件或 null
   */
  static async findAgentByUserId(userId) {
    const res = await query("SELECT * FROM agents WHERE user_id = $1", [userId]);
    return res.rows[0] || null;
  }

  /**
   * 根據代理 ID 查詢代理資訊
   * @param {number} agentId - 代理 ID
   * @returns {Promise<object|null>} 代理資訊物件或 null
   */
  static async findAgentById(agentId) {
    const res = await query("SELECT * FROM agents WHERE id = $1", [agentId]);
    return res.rows[0] || null;
  }

  /**
   * 創建新代理
   * @param {object} agentData - 代理資料
   * @returns {Promise<object>} 新創建的代理資訊
   */
  static async createAgent(agentData) {
    const { userId, name, contactPerson, contactEmail, phoneNumber, parentAgentId, commissionRateType, baseCommissionRate, markupRate } = agentData;
    const res = await query(
      `INSERT INTO agents (user_id, name, contact_person, contact_email, phone_number, parent_agent_id, commission_rate_type, base_commission_rate, markup_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, name, contactPerson, contactEmail, phoneNumber, parentAgentId, commissionRateType, baseCommissionRate, markupRate]
    );
    return res.rows[0];
  }

  /**
   * 更新代理資訊
   * @param {number} agentId - 代理 ID
   * @param {object} updateData - 要更新的資料
   * @returns {Promise<object|null>} 更新後的代理資訊或 null
   */
  static async updateAgent(agentId, updateData) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(updateData[key]);
      }
    }

    if (setClauses.length === 0) {
      return this.findAgentById(agentId); // 沒有要更新的資料
    }

    values.push(agentId);
    const res = await query(
      `UPDATE agents SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  }

  /**
   * 建立代理層級關係
   * @param {number} ancestorId - 祖先代理 ID
   * @param {number} descendantId - 後代代理 ID
   * @param {number} depth - 層級深度
   * @returns {Promise<object>} 新創建的層級關係
   */
  static async createAgentHierarchy(ancestorId, descendantId, depth) {
    const res = await query(
      `INSERT INTO agent_hierarchy (ancestor_id, descendant_id, depth) VALUES ($1, $2, $3) RETURNING *`,
      [ancestorId, descendantId, depth]
    );
    return res.rows[0];
  }

  /**
   * 查詢代理的所有下級代理和商戶
   * @param {number} agentId - 代理 ID
   * @returns {Promise<object>} 包含下級代理和商戶的物件
   */
  static async getSubordinates(agentId) {
    const subAgentsRes = await query(
      `SELECT a.id, a.name, a.contact_email, a.status, a.commission_rate_type, a.base_commission_rate, a.markup_rate, 'agent' as type
       FROM agents a
       JOIN agent_hierarchy ah ON a.id = ah.descendant_id
       WHERE ah.ancestor_id = $1 AND ah.depth = 1`,
      [agentId]
    );

    const merchantsRes = await query(
      `SELECT m.id, m.name, m.contact_email, m.status, 'merchant' as type
       FROM merchants m
       WHERE m.parent_agent_id = $1`,
      [agentId]
    );

    return { subAgents: subAgentsRes.rows, merchants: merchantsRes.rows };
  }

  /**
   * 查詢代理的分潤記錄
   * @param {number} agentId - 代理 ID
   * @param {object} filters - 過濾條件 (例如：currencyCode, status, startDate, endDate)
   * @returns {Promise<Array<object>>} 分潤記錄列表
   */
  static async getAgentCommissionRecords(agentId, filters = {}) {
    let queryString = `SELECT * FROM agent_commission_records WHERE agent_id = $1`;
    const values = [agentId];
    let paramIndex = 2;

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
   * 查詢代理的直接下級代理
   * @param {number} agentId - 代理 ID
   * @returns {Promise<Array<object>>} 直接下級代理列表
   */
  static async findDirectSubAgents(agentId) {
    const res = await query(
      `SELECT a.* FROM agents a JOIN agent_hierarchy ah ON a.id = ah.descendant_id WHERE ah.ancestor_id = $1 AND ah.depth = 1`,
      [agentId]
    );
    return res.rows;
  }

  /**
   * 查詢代理的直接下級商戶
   * @param {number} agentId - 代理 ID
   * @returns {Promise<Array<object>>} 直接下級商戶列表
   */
  static async findDirectMerchants(agentId) {
    const res = await query(
      `SELECT * FROM merchants WHERE parent_agent_id = $1`,
      [agentId]
    );
    return res.rows;
  }

  /**
   * 創建新使用者
   * @param {object} userData - 使用者資料
   * @returns {Promise<object>} 新創建的使用者資訊
   */
  static async createUser(userData) {
    const { username, passwordHash, email, phoneNumber, userType } = userData;
    const res = await query(
      `INSERT INTO users (username, password_hash, email, phone_number, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, passwordHash, email, phoneNumber, userType]
    );
    return res.rows[0];
  }

  /**
   * 創建新商戶
   * @param {object} merchantData - 商戶資料
   * @returns {Promise<object>} 新創建的商戶資訊
   */
  static async createMerchant(merchantData) {
    const { userId, name, legalName, contactPerson, contactEmail, phoneNumber, address, website, parentAgentId } = merchantData;
    const res = await query(
      `INSERT INTO merchants (user_id, name, legal_name, contact_person, contact_email, phone_number, address, website, parent_agent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, name, legalName, contactPerson, contactEmail, phoneNumber, address, website, parentAgentId]
    );
    return res.rows[0];
  }

  /**
   * 獲取代理的所有祖先代理 ID 及其深度
   * @param {number} agentId - 代理 ID
   * @returns {Promise<Array<object>>} 祖先代理 ID 及其深度列表
   */
  static async getAgentAncestors(agentId) {
    const res = await query(
      `SELECT ancestor_id, depth FROM agent_hierarchy WHERE descendant_id = $1 AND depth > 0 ORDER BY depth DESC`,
      [agentId]
    );
    return res.rows;
  }

  /**
   * 獲取指定祖先代理到後代代理的深度
   * @param {number} ancestorId - 祖先代理 ID
   * @param {number} descendantId - 後代代理 ID
   * @returns {Promise<number|null>} 深度或 null
   */
  static async getHierarchyDepth(ancestorId, descendantId) {
    const res = await query(
      `SELECT depth FROM agent_hierarchy WHERE ancestor_id = $1 AND descendant_id = $2`,
      [ancestorId, descendantId]
    );
    return res.rows[0] ? res.rows[0].depth : null;
  }

  /**
   * 檢查代理是否存在
   * @param {number} agentId - 代理 ID
   * @returns {Promise<boolean>} 如果存在則為 true，否則為 false
   */
  static async agentExists(agentId) {
    const res = await query("SELECT 1 FROM agents WHERE id = $1", [agentId]);
    return res.rows.length > 0;
  }

  /**
   * 檢查商戶是否存在
   * @param {number} merchantId - 商戶 ID
   * @returns {Promise<boolean>} 如果存在則為 true，否則為 false
   */
  static async merchantExists(merchantId) {
    const res = await query("SELECT 1 FROM merchants WHERE id = $1", [merchantId]);
    return res.rows.length > 0;
  }

  /**
   * 檢查使用者名稱或電子郵件是否已存在
   * @param {string} username - 使用者名稱
   * @param {string} email - 電子郵件
   * @returns {Promise<boolean>} 如果存在則為 true，否則為 false
   */
  static async userExists(username, email) {
    const res = await query("SELECT 1 FROM users WHERE username = $1 OR email = $2", [username, email]);
    return res.rows.length > 0;
  }
}

module.exports = AgentModel;
