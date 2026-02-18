// 前言：此檔案定義了 Agent 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `agents` 表的資料庫操作方法，例如查找所有代理商和創建代理商。

const db = require("../../src/config/db"); // 引入共用資料庫實例

const TABLE_NAME = "agents";

class AgentModel {
  static async findAll() {
    return db(TABLE_NAME).select("*");
  }

  static async findById(id) {
    return db(TABLE_NAME).where({ id }).first();
  }

  static async create(agentData) {
    const [newAgent] = await db(TABLE_NAME).insert(agentData).returning("*");
    return newAgent;
  }

  static async update(id, updateData) {
    const [updatedAgent] = await db(TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedAgent;
  }

  static async delete(id) {
    return db(TABLE_NAME).where({ id }).del();
  }
}

module.exports = AgentModel;
