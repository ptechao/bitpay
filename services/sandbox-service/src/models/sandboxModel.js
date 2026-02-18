
/**
 * @file services/sandbox-service/src/models/sandboxModel.js
 * @description 聚合支付平台沙盒服務的資料模型。
 *              目前使用記憶體模擬資料庫操作，實際部署應替換為 PostgreSQL + Knex.js。
 * @author Manus AI
 * @date 2026-02-19
 */

const { v4: uuidv4 } = require("uuid");

// 模擬資料庫，實際應替換為 PostgreSQL + Knex.js
const sandboxOrders = [];

/**
 * 初始化資料庫（模擬）。
 * 在實際應用中，這裡會是資料庫連線和遷移的邏輯。
 */
exports.initializeDatabase = async () => {
  console.log("沙盒資料庫初始化完成 (模擬).");
  // 實際應連接 PostgreSQL 並執行 Knex 遷移
};

/**
 * 創建一個新的沙盒訂單。
 * @param {object} orderData - 訂單數據，包含 merchantId, amount, currency, orderRef, notifyUrl, status。
 * @returns {Promise<object>} 創建後的訂單物件。
 */
exports.createSandboxOrder = async (orderData) => {
  const newOrder = {
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...orderData,
  };
  sandboxOrders.push(newOrder);
  return newOrder;
};

/**
 * 根據 ID 獲取沙盒訂單。
 * @param {string} orderId - 訂單 ID。
 * @returns {Promise<object|null>} 訂單物件或 null。
 */
exports.getSandboxOrderById = async (orderId) => {
  return sandboxOrders.find((order) => order.id === orderId) || null;
};

/**
 * 更新沙盒訂單。
 * @param {string} orderId - 訂單 ID。
 * @param {object} updateData - 要更新的數據。
 * @returns {Promise<object|null>} 更新後的訂單物件或 null。
 */
exports.updateSandboxOrder = async (orderId, updateData) => {
  const index = sandboxOrders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    sandboxOrders[index] = { ...sandboxOrders[index], ...updateData, updatedAt: new Date() };
    return sandboxOrders[index];
  }
  return null;
};
