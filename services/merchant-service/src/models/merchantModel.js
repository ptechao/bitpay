// 前言：此檔案定義了 Merchant 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `merchants` 和 `merchant_accounts` 表的資料庫操作方法，例如查找所有商戶和創建商戶。

const db = require("../../src/config/db"); // 引入共用資料庫實例

const TABLE_NAME = "merchants";

class MerchantModel {
  static async findAll() {
    return db(TABLE_NAME).select("*");
  }

  static async findById(id) {
    return db(TABLE_NAME).where({ id }).first();
  }

  static async create(merchantData) {
    const [newMerchant] = await db(TABLE_NAME).insert(merchantData).returning("*");
    return newMerchant;
  }

  static async update(id, updateData) {
    const [updatedMerchant] = await db(TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedMerchant;
  }

  static async delete(id) {
    return db(TABLE_NAME).where({ id }).del();
  }
}

module.exports = MerchantModel;
