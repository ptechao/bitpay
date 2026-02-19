// 前言：此檔案定義了 Risk-Control 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `risk_rules` 和 `risk_logs` 表的資料庫操作方法，例如查找所有風控規則和創建風控規則。

const db = require("../config/db"); // 引入共用資料庫實例

const RULES_TABLE_NAME = "risk_rules";
const LOGS_TABLE_NAME = "risk_logs";

class RiskControlModel {
  static async findAllRules() {
    return db(RULES_TABLE_NAME).select("*");
  }

  static async findRuleById(id) {
    return db(RULES_TABLE_NAME).where({ id }).first();
  }

  static async createRule(ruleData) {
    const [newRule] = await db(RULES_TABLE_NAME).insert(ruleData).returning("*");
    return newRule;
  }

  static async updateRule(id, updateData) {
    const [updatedRule] = await db(RULES_TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedRule;
  }

  static async deleteRule(id) {
    return db(RULES_TABLE_NAME).where({ id }).del();
  }

  static async createLog(logData) {
    const [newLog] = await db(LOGS_TABLE_NAME).insert(logData).returning("*");
    return newLog;
  }

  static async findLogsByTransactionId(transactionId) {
    return db(LOGS_TABLE_NAME).where({ transaction_id: transactionId }).select("*");
  }
}

module.exports = RiskControlModel;
