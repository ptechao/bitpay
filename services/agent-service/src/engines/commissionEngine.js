/**
 * @file services/agent-service/src/engines/commissionEngine.js
 * @description 分潤計算引擎，支援多種分潤模式和多層級代理分潤。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");
const BigNumber = require("bignumber.js");
const { v4: uuidv4 } = require("uuid");

const MAX_AGENT_LEVELS = 5; // 最多支援 5 層代理

/**
 * 計算單筆交易的分潤
 * @param {object} transaction - 交易物件，包含 amount, currency, merchant_id, agent_id (直接上級代理)
 * @returns {Promise<Array<object>>} - 各級代理的分潤記錄陣列
 */
async function calculateCommission(transaction) {
  const commissionRecords = [];
  const transactionAmount = new BigNumber(transaction.amount);

  if (transactionAmount.isLessThanOrEqualTo(0)) {
    console.log(`[CommissionEngine] 交易金額為零或負數，無需計算分潤。`);
    return commissionRecords;
  }

  // 獲取直接上級代理
  let currentAgentId = transaction.agent_id;
  let currentLevel = 1;

  while (currentAgentId && currentLevel <= MAX_AGENT_LEVELS) {
    const agent = await knex("agents")
      .where({ id: currentAgentId })
      .select("id", "parent_agent_id", "commission_rate_type", "base_commission_rate", "markup_rate")
      .first();

    if (!agent) {
      console.warn(`[CommissionEngine] 代理 ${currentAgentId} 不存在，停止向上追溯。`);
      break;
    }

    let commissionAmount = new BigNumber(0);
    const baseCommissionRate = new BigNumber(agent.base_commission_rate || 0);
    const markupRate = new BigNumber(agent.markup_rate || 0);

    switch (agent.commission_rate_type) {
      case "percentage":
        commissionAmount = transactionAmount.times(baseCommissionRate);
        break;
      case "fixed":
        commissionAmount = baseCommissionRate; // 固定金額分潤
        break;
      case "markup":
        // Mark-up 分潤：假設交易金額中包含了代理加價部分
        // 這裡需要更複雜的邏輯來確定加價部分，目前簡化為按 markup_rate 計算
        // 實際應用中，可能需要從 transaction.metadata 中獲取原始價格和銷售價格來計算加價
        commissionAmount = transactionAmount.times(markupRate); // 假設 markup_rate 是加價比例
        break;
      default:
        console.warn(`[CommissionEngine] 代理 ${agent.id} 的分潤模式 ${agent.commission_rate_type} 不支援。`);
        break;
    }

    if (commissionAmount.isGreaterThan(0)) {
      commissionRecords.push({
        id: uuidv4(),
        transaction_id: transaction.id,
        agent_id: agent.id,
        commission_amount: commissionAmount.toFixed(4),
        currency: transaction.currency,
        commission_type: agent.commission_rate_type,
        commission_rate: baseCommissionRate.toFixed(4),
        markup_rate: markupRate.toFixed(4),
        level: currentLevel,
        status: "pending", // 初始狀態為 pending，待結算
      });
    }

    currentAgentId = agent.parent_agent_id;
    currentLevel++;
  }

  return commissionRecords;
}

module.exports = {
  calculateCommission,
};
