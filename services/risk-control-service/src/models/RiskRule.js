// src/models/RiskRule.js
/**
 * @file 風控規則模型
 * @description 定義風控規則的資料庫操作。
 * @author Manus AI
 */

const BaseModel = require("./baseModel");

class RiskRule extends BaseModel {
  constructor() {
    super("risk_rules");
  }

  /**
   * 查詢所有啟用的風控規則，並按優先級排序。
   * @returns {Promise<Array<object>>} 啟用的風控規則陣列
   */
  async findActiveRules() {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'active' ORDER BY priority DESC`;
    const { rows } = await this.pool.query(query);
    return rows;
  }
}

module.exports = new RiskRule();
