// 前言：此檔案定義了 Channel 微服務的資料模型，使用 Knex.js 查詢建構器與 PostgreSQL 互動。
// 它包含了對 `channels` 表的資料庫操作方法，例如查找所有支付通道和創建支付通道。

const db = require("../../src/config/db"); // 引入共用資料庫實例

const TABLE_NAME = "channels";

class ChannelModel {
  static async findAll() {
    return db(TABLE_NAME).select("*");
  }

  static async findById(id) {
    return db(TABLE_NAME).where({ id }).first();
  }

  static async create(channelData) {
    const [newChannel] = await db(TABLE_NAME).insert(channelData).returning("*");
    return newChannel;
  }

  static async update(id, updateData) {
    const [updatedChannel] = await db(TABLE_NAME).where({ id }).update(updateData).returning("*");
    return updatedChannel;
  }

  static async delete(id) {
    return db(TABLE_NAME).where({ id }).del();
  }
}

module.exports = ChannelModel;
