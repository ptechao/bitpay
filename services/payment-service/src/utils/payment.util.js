
/**
 * @fileoverview 支付工具函數
 * @description 提供 QR 碼生成和簽名驗證等功能。
 */

const QRCode = require("qrcode");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const PAYMENT_SECRET_KEY = process.env.PAYMENT_SECRET_KEY || "supersecretpaymentkey";

class PaymentUtil {
  /**
   * 生成 QR 碼
   * @param {string} text - 欲編碼成 QR 碼的文字
   * @returns {Promise<string>} QR 碼的 Data URL (base64 圖片資料)
   */
  static async generateQRCode(text) {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      console.error("生成 QR 碼失敗", err);
      throw new Error("無法生成 QR 碼");
    }
  }

  /**
   * 驗證支付回調簽名
   * @param {object} data - 回調資料物件
   * @param {string} signature - 接收到的簽名
   * @returns {boolean} 簽名是否有效
   */
  static verifySignature(data, signature) {
    const dataString = JSON.stringify(data); // 確保資料順序一致
    const hash = crypto.createHmac("sha256", PAYMENT_SECRET_KEY).update(dataString).digest("hex");
    return hash === signature;
  }

  /**
   * 生成支付簽名
   * @param {object} data - 欲簽名的資料物件
   * @returns {string} 生成的簽名
   */
  static generateSignature(data) {
    const dataString = JSON.stringify(data);
    return crypto.createHmac("sha256", PAYMENT_SECRET_KEY).update(dataString).digest("hex");
  }
}

module.exports = PaymentUtil;
