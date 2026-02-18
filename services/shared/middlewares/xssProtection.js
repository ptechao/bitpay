
/**
 * @file services/shared/middlewares/xssProtection.js
 * @description 聚合支付平台 XSS (跨站點腳本) 保護中介軟體。
 *              使用 Helmet 庫來設置 HTTP 頭，以防止 XSS 攻擊。
 * @author Manus AI
 * @date 2026-02-19
 */

const helmet = require("helmet");

// 使用 Helmet 的 xssFilter 中介軟體來設置 X-XSS-Protection 頭
// 這會啟用瀏覽器內置的 XSS 過濾器 (如果有的話)
const xssProtection = helmet.xssFilter();

module.exports = xssProtection;
