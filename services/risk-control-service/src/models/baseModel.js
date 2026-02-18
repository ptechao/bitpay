// src/models/baseModel.js
/**
 * @file 通道管理服務基礎模型
 * @description 提供通用的資料庫操作方法，供其他模型繼承使用。
 * @author Manus AI
 */

const { pool } = require("../config/db");

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool; // 將 pool 賦值給實例，以便子類和實例方法訪問
  }

  /**
   * 根據 ID 查詢單一記錄
   * @param {number} id - 記錄 ID
   * @returns {Promise<object|null>} 查詢結果或 null
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * 查詢所有記錄
   * @returns {Promise<Array<object>>} 所有記錄的陣列
   */
  async findAll() {
    const query = `SELECT * FROM ${this.tableName}`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  /**
   * 根據條件查詢記錄
   * @param {object} conditions - 查詢條件，鍵值對形式
   * @returns {Promise<Array<object>>} 符合條件的記錄陣列
   */
  async findBy(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(" AND ");
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    const { rows } = await this.pool.query(query, values);
    return rows;
  }

  /**
   * 創建新記錄
   * @param {object} data - 要創建的資料，鍵值對形式
   * @returns {Promise<object>} 創建的記錄
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  /**
   * 更新記錄
   * @param {number} id - 要更新的記錄 ID
   * @param {object} data - 要更新的資料，鍵值對形式
   * @returns {Promise<object|null>} 更新後的記錄或 null
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const { rows } = await this.pool.query(query, [...values, id]);
    return rows[0] || null;
  }

  /**
   * 刪除記錄
   * @param {number} id - 要刪除的記錄 ID
   * @returns {Promise<object|null>} 刪除的記錄或 null
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = BaseModel;
