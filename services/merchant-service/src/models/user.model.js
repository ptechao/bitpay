
/**
 * @fileoverview 使用者模型
 * @description 處理使用者資料庫操作，包括使用者註冊、查詢等。
 */

const db = require("../config/db");

class User {
  /**
   * 建立新使用者
   * @param {object} userData - 使用者資料
   * @returns {Promise<object>} 新建立的使用者資料
   */
  static async create(userData) {
    const { username, passwordHash, email, phoneNumber, userType } = userData;
    const res = await db.query(
      `INSERT INTO users (username, password_hash, email, phone_number, user_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, passwordHash, email, phoneNumber, userType]
    );
    return res.rows[0];
  }

  /**
   * 根據 ID 查詢使用者
   * @param {number} id - 使用者 ID
   * @returns {Promise<object>} 使用者資料
   */
  static async findById(id) {
    const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
  }

  /**
   * 根據使用者名稱查詢使用者
   * @param {string} username - 使用者名稱
   * @returns {Promise<object>} 使用者資料
   */
  static async findByUsername(username) {
    const res = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    return res.rows[0];
  }

  /**
   * 根據電子郵件查詢使用者
   * @param {string} email - 電子郵件
   * @returns {Promise<object>} 使用者資料
   */
  static async findByEmail(email) {
    const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0];
  }
}

module.exports = User;
