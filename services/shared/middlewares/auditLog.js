/**
 * @file services/shared/middlewares/auditLog.js
 * @description Express 中間件，自動記錄所有 API 操作到 audit_logs 表。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");

/**
 * 操作日誌 Express 中間件
 * @param {object} req - Express 請求物件
 * @param {object} res - Express 回應物件
 * @param {function} next - Express 下一個中間件函數
 */
async function auditLogMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();

  // 提取操作者資訊 (假設已在身份驗證中間件中設置)
  const operatorId = req.user ? req.user.id : null; // 假設 req.user 包含使用者資訊
  const operatorRole = req.user ? req.user.role : "guest";
  const ipAddress = req.ip || req.connection.remoteAddress;

  // 記錄請求資訊
  const logEntry = {
    operator_id: operatorId,
    operator_role: operatorRole,
    action_type: req.method, // 使用 HTTP 方法作為操作類型
    target_entity: req.baseUrl + req.path, // 記錄請求路徑作為目標實體
    target_id: req.params.id || null, // 如果有 ID 參數，記錄下來
    request_params: { body: req.body, query: req.query, params: req.params },
    ip_address: ipAddress,
    action_result: "failed", // 預設為失敗，成功時會更新
    error_message: null,
  };

  // 監聽回應結束事件
  res.on("finish", async () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // 毫秒

    logEntry.action_result = res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failed";
    // 如果有錯誤訊息，可以在這裡捕獲，但通常在錯誤處理中間件中處理更合適
    // logEntry.error_message = res.locals.errorMessage || null;

    try {
      await knex("audit_logs").insert(logEntry);
      // console.log(`[AuditLog] 操作日誌已記錄: ${logEntry.action_type} ${logEntry.target_entity} - ${logEntry.action_result}`);
    } catch (error) {
      console.error("[AuditLog] 記錄操作日誌失敗:", error);
    }
  });

  next();
}

module.exports = auditLogMiddleware;
