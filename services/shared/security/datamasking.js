
/**
 * @file services/shared/security/datamasking.js
 * @description 聚合支付平台數據遮蔽工具。
 *              用於保護敏感數據在日誌、顯示或傳輸時不被完全暴露。
 * @author Manus AI
 * @date 2026-02-19
 */

/**
 * 遮蔽字串中的一部分內容。
 * @param {string} data - 原始字串。
 * @param {number} [startVisible=4] - 開頭可見的字元數。
 * @param {number} [endVisible=4] - 結尾可見的字元數。
 * @param {string} [maskChar=\'*\'] - 用於遮蔽的字元。
 * @returns {string} 遮蔽後的字串。
 */
exports.maskString = (data, startVisible = 4, endVisible = 4, maskChar = \'*\') => {
  if (typeof data !== \'string\' || !data) {
    return data;
  }

  const len = data.length;
  if (len <= startVisible + endVisible) {
    return maskChar.repeat(len); // 如果字串太短，全部遮蔽
  }

  const start = data.substring(0, startVisible);
  const end = data.substring(len - endVisible, len);
  const masked = maskChar.repeat(len - startVisible - endVisible);

  return `${start}${masked}${end}`;
};

/**
 * 遮蔽電子郵件地址。
 * @param {string} email - 原始電子郵件地址。
 * @returns {string} 遮蔽後的電子郵件地址。
 */
exports.maskEmail = (email) => {
  if (typeof email !== \'string\' || !email) {
    return email;
  }

  const atIndex = email.indexOf(\'@\');
  if (atIndex <= 1) { // 如果沒有 @ 或 @ 在開頭
    return exports.maskString(email, 1, 0); // 至少顯示一個字元
  }

  const username = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  const maskedUsername = exports.maskString(username, Math.min(2, username.length), 0); // 用戶名至少顯示前兩個字元
  const maskedDomain = exports.maskString(domain, 0, domain.indexOf(\'.\') > -1 ? domain.length - domain.indexOf(\'.\') : 2); // 域名顯示後綴或至少兩個字元

  return `${maskedUsername}@${maskedDomain}`;
};

/**
 * 遮蔽物件中的指定敏感欄位。
 * @param {object} obj - 原始物件。
 * @param {Array<string>} fieldsToMask - 需要遮蔽的欄位名稱陣列。
 * @param {string} [maskChar=\'*\'] - 用於遮蔽的字元。
 * @returns {object} 遮蔽敏感欄位後的物件。
 */
exports.maskObjectFields = (obj, fieldsToMask, maskChar = \'*\') => {
  if (typeof obj !== \'object\' || obj === null) {
    return obj;
  }

  const maskedObj = { ...obj };
  for (const field of fieldsToMask) {
    if (maskedObj.hasOwnProperty(field) && typeof maskedObj[field] === \'string\') {
      // 根據欄位類型進行更精細的遮蔽，例如 email 欄位使用 maskEmail
      if (field.toLowerCase().includes(\'email\')) {
        maskedObj[field] = exports.maskEmail(maskedObj[field]);
      } else {
        maskedObj[field] = exports.maskString(maskedObj[field], 4, 4, maskChar);
      }
    } else if (maskedObj.hasOwnProperty(field) && typeof maskedObj[field] === \'number\') {
      // 數字類型簡單轉換為字串後遮蔽
      maskedObj[field] = exports.maskString(String(maskedObj[field]), 0, 0, maskChar);
    }
  }
  return maskedObj;
};
