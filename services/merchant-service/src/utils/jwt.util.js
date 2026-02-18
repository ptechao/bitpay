
/**
 * @fileoverview JWT 工具函數
 * @description 用於生成和驗證 JWT token。
 */

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || "supersecretjwtkey";

class JwtUtil {
  /**
   * 生成 JWT token
   * @param {object} payload - 包含在 token 中的資料
   * @param {string} expiresIn - token 過期時間 (e.g., "1h", "7d")
   * @returns {string} 生成的 JWT token
   */
  static generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
  }

  /**
   * 驗證 JWT token
   * @param {string} token - 欲驗證的 JWT token
   * @returns {object|null} 驗證成功則返回 payload，否則返回 null
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JwtUtil;
