
/**
 * @file services/shared/middlewares/signatureVerify.js
 * @description 聚合支付平台 HMAC-SHA256 簽名驗證中介軟體。
 *              用於驗證來自外部系統 (如商戶回調) 請求的完整性和真實性。
 * @author Manus AI
 * @date 2026-02-19
 */

const crypto = require("crypto");

/**
 * 驗證請求簽名的中介軟體。
 * 預期請求頭中包含 `X-Signature` 和 `X-Timestamp`。
 * 簽名是基於請求體、時間戳和共享密鑰生成的 HMAC-SHA256。
 * @param {string} secretKey - 用於簽名驗證的共享密鑰。
 * @returns {Function} Express 中介軟體函數。
 */
const signatureVerify = (secretKey) => {
  return (req, res, next) => {
    const signature = req.headers["x-signature"];
    const timestamp = req.headers["x-timestamp"];
    const body = JSON.stringify(req.body); // 確保請求體是 JSON 格式

    if (!signature || !timestamp) {
      return res.status(401).json({ code: "401", message: "缺少簽名或時間戳。" });
    }

    // 檢查時間戳是否在合理範圍內，防止重放攻擊
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 分鐘
    const requestTime = parseInt(timestamp, 10);
    if (isNaN(requestTime) || Date.now() - requestTime > FIVE_MINUTES || requestTime - Date.now() > FIVE_MINUTES) {
      return res.status(401).json({ code: "401", message: "時間戳無效或已過期。" });
    }

    // 構造用於簽名的原始字串
    const dataToSign = `${body}.${timestamp}`;

    // 計算預期簽名
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(403).json({ code: "403", message: "簽名驗證失敗。" });
    }

    next();
  };
};

module.exports = signatureVerify;
