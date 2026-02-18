// 前言：此檔案定義了 Settlement 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `settlements` 和 `settlement_details` 表的資料庫操作方法，例如查找所有結算記錄和創建結算記錄。

const db = require("../../src/config/db"); // 引入共用資料庫實例

const TABLE_NAME = "settlements";

class SettlementModel {
  static async findAll() {
    return db(TABLE_NAME).select("*");
  }

  static async findById(id) {
    return db(TABLE_NAME).where({ id }).first();
  }

  static async create(settlementData) {
    const [newSettlement] = await db(TABLE_NAME).insert(settlementData).returning("*");
    return newSettlement;
  }

  static async update(id, updateData) {
    const [updatedSettlement] = await db(TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedSettlement;
  }

  static async delete(id) {
    return db(TABLE_NAME).where({ id }).del();
  }
}

module.exports = SettlementModel;
