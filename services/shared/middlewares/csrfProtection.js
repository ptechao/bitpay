
/**
 * @file services/shared/middlewares/csrfProtection.js
 * @description 聚合支付平台 CSRF (跨站請求偽造) 保護中介軟體。
 *              使用 csurf 庫來生成和驗證 CSRF token，防止惡意網站發送未經授權的請求。
 * @author Manus AI
 * @date 2026-02-19
 */

const csrf = require("csurf");
const cookieParser = require("cookie-parser");

// CSRF 保護中介軟體配置
// 這裡假設會與 Express 應用程式一起使用
const csrfProtection = csrf({ cookie: true });

// 為了使用 csurf，需要先使用 cookie-parser
// 這通常會在 Express 應用程式的入口檔案中配置
// app.use(cookieParser());
// app.use(csrfProtection);

// 導出中介軟體和一個獲取 token 的函數
module.exports = {
  csrfProtection,
  /**
   * 獲取 CSRF token 的函數。
   * @param {object} req - Express 請求物件。
   * @returns {string} CSRF token。
   */
  getCsrfToken: (req) => {
    return req.csrfToken();
  },
};
