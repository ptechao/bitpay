/**
 * @file services/shared/models/auditLogModel.js
 * @description 操作日誌 Model，提供查詢和匯出日誌的功能。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");

class AuditLogModel {
  /**
   * 查詢操作日誌
   * @param {object} filters - 篩選條件
   * @param {string} [filters.operatorId] - 操作者 ID
   * @param {string} [filters.actionType] - 操作類型 (e.g., CREATE, UPDATE, DELETE, READ)
   * @param {string} [filters.targetEntity] - 操作目標實體
   * @param {string} [filters.actionResult] - 操作結果 (success/failed)
   * @param {string} [filters.startDate] - 開始日期 (ISO 格式)
   * @param {string} [filters.endDate] - 結束日期 (ISO 格式)
   * @param {number} [limit=100] - 限制返回的記錄數
   * @param {number} [offset=0] - 偏移量
   * @returns {Promise<Array<object>>} - 操作日誌記錄陣列
   */
  static async queryLogs(filters = {}, limit = 100, offset = 0) {
    const query = knex("audit_logs").select("*");

    if (filters.operatorId) {
      query.where({ operator_id: filters.operatorId });
    }
    if (filters.actionType) {
      query.where({ action_type: filters.actionType });
    }
    if (filters.targetEntity) {
      query.where({ target_entity: filters.targetEntity });
    }
    if (filters.actionResult) {
      query.where({ action_result: filters.actionResult });
    }
    if (filters.startDate) {
      query.andWhere("created_at", ">=", filters.startDate);
    }
    if (filters.endDate) {
      query.andWhere("created_at", "<=", filters.endDate);
    }

    query.limit(limit).offset(offset).orderBy("created_at", "desc");

    return query;
  }

  /**
   * 匯出操作日誌 (CSV 格式)
   * @param {object} filters - 篩選條件 (同 queryLogs)
   * @returns {Promise<string>} - CSV 格式的日誌字串
   */
  static async exportLogsToCsv(filters = {}) {
    const logs = await this.queryLogs(filters, 99999999); // 匯出時不限制數量

    if (logs.length === 0) {
      return "";
    }

    const headers = Object.keys(logs[0]);
    const csvRows = [];
    csvRows.push(headers.join(",")); // 添加標題行

    for (const log of logs) {
      const values = headers.map(header => {
        const value = log[header];
        // 處理逗號和引號，確保 CSV 格式正確
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, "\"\"")}"`;
        } else if (typeof value === "object" && value !== null) {
          // 將 JSON 物件轉換為字串，並處理其中的逗號和引號
          const jsonString = JSON.stringify(value);
          return `"${jsonString.replace(/"/g, "\"\"")}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }
}

module.exports = AuditLogModel;
