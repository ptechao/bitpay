// 前言：此檔案定義了 Payment 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `transactions` 和 `payments` 表的資料庫操作方法，例如查找所有支付和創建支付。

const db = require("../../src/config/db"); // 引入共用資料庫實例

const TABLE_NAME = "payments";

class PaymentModel {
  static async findAll() {
    return db(TABLE_NAME).select("*");
  }

  static async findById(id) {
    return db(TABLE_NAME).where({ id }).first();
  }

  static async create(paymentData) {
    const [newPayment] = await db(TABLE_NAME).insert(paymentData).returning("*");
    return newPayment;
  }

  static async update(id, updateData) {
    const [updatedPayment] = await db(TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedPayment;
  }

  static async delete(id) {
    return db(TABLE_NAME).where({ id }).del();
  }
}

module.exports = PaymentModel;
