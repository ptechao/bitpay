
/**
 * @file services/shared/security/encryption.js
 * @description 聚合支付平台 AES-256 加密和解密工具。
 *              用於保護敏感數據的傳輸和儲存。
 * @author Manus AI
 * @date 2026-02-19
 */

const crypto = require("crypto");

// 建議從環境變數中獲取，並確保其安全。
// 密鑰必須是 32 位元組 (256 位元) 長度。
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a_very_secret_key_of_32_chars_for_aes"; // 替換為實際的強密鑰
const IV_LENGTH = 16; // AES 要求的 IV 長度為 16 位元組

if (ENCRYPTION_KEY.length !== 32) {
  console.warn("警告: ENCRYPTION_KEY 長度不是 32 位元組，請使用安全的 256 位元密鑰。");
}

/**
 * 使用 AES-256-CBC 加密數據。
 * @param {string} text - 要加密的明文。
 * @returns {string} 加密後的數據，格式為 iv:encryptedText (Base64 編碼)。
 */
exports.encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

/**
 * 使用 AES-256-CBC 解密數據。
 * @param {string} text - 要解密的密文，格式為 iv:encryptedText (Base64 編碼)。
 * @returns {string} 解密後的明文。
 */
exports.decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
