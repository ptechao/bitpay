// src/models/Whitelist.js
/**
 * @file 風控服務白名單模型
 * @description 定義白名單的資料庫操作。
 * @author Manus AI
 */

const BaseModel = require("./baseModel");

class Whitelist extends BaseModel {
  constructor() {
    super("whitelist");
  }

  /**
   * 根據類型和值查詢白名單記錄。
   * @param {string} type - 白名單類型 (e.g., ip, user_id, device_id)
   * @param {string} value - 白名單值
   * @returns {Promise<object|null>} 查詢結果或 null
   */
  async findByTypeAndValue(type, value) {
    const query = `SELECT * FROM ${this.tableName} WHERE type = $1 AND value = $2`;
    const { rows } = await this.pool.query(query, [type, value]);
    return rows[0] || null;
  }
}

module.exports = new Whitelist();
