/**
 * @file services/agent-service/src/jobs/commissionSettlementJob.js
 * @description 定時將累計的分潤金額結算到代理帳戶。
 * @author Manus AI
 * @date 2026-02-19
 */

const cron = require("node-cron");
const knex = require("../config/database");
const BigNumber = require("bignumber.js");

/**
 * 掃描並結算代理分潤
 */
async function settleAgentCommissions() {
  console.log(`[CommissionSettlementJob] 開始掃描並結算代理分潤...`);

  try {
    // 查詢所有狀態為 'pending' 的分潤記錄
    const pendingCommissions = await knex("commission_records")
      .where({ status: "pending" })
      .select("id", "agent_id", "commission_amount", "currency");

    if (pendingCommissions.length === 0) {
      console.log(`[CommissionSettlementJob] 未發現待結算的分潤記錄。`);
      return;
    }

    console.log(`[CommissionSettlementJob] 發現 ${pendingCommissions.length} 筆待結算分潤，準備處理...`);

    // 按代理和幣種進行分組匯總
    const aggregatedCommissions = pendingCommissions.reduce((acc, record) => {
      const key = `${record.agent_id}-${record.currency}`;
      if (!acc[key]) {
        acc[key] = {
          agent_id: record.agent_id,
          currency: record.currency,
          total_commission: new BigNumber(0),
          record_ids: [],
        };
      }
      acc[key].total_commission = acc[key].total_commission.plus(new BigNumber(record.commission_amount));
      acc[key].record_ids.push(record.id);
      return acc;
    }, {});

    for (const key in aggregatedCommissions) {
      const { agent_id, currency, total_commission, record_ids } = aggregatedCommissions[key];

      if (total_commission.isGreaterThan(0)) {
        try {
          await knex.transaction(async trx => {
            // 查找或創建代理帳戶
            let agentAccount = await trx("agent_accounts")
              .where({ agent_id: agent_id, currency: currency })
              .first();

            if (!agentAccount) {
              agentAccount = await trx("agent_accounts").insert({
                agent_id: agent_id,
                currency: currency,
                balance: 0,
                frozen_amount: 0,
              }).returning("*").then(rows => rows[0]);
            }

            // 更新代理帳戶餘額
            await trx("agent_accounts")
              .where({ id: agentAccount.id })
              .increment("balance", total_commission.toFixed(4));

            // 更新分潤記錄狀態為 'settled'
            await trx("commission_records")
              .whereIn("id", record_ids)
              .update({ status: "settled", updated_at: knex.fn.now() });

            console.log(`[CommissionSettlementJob] 代理 ${agent_id} 的 ${currency} 分潤 ${total_commission.toFixed(4)} 已結算。`);
          });
        } catch (error) {
          console.error(`[CommissionSettlementJob] 結算代理 ${agent_id} 的 ${currency} 分潤失敗:`, error);
        }
      }
    }
    console.log(`[CommissionSettlementJob] 代理分潤結算排程執行完畢。`);
  } catch (error) {
    console.error("[CommissionSettlementJob] 掃描分潤記錄時發生錯誤:", error);
  }
}

/**
 * 啟動分潤結算排程任務
 * 預設每天凌晨 3 點執行一次
 */
function startCommissionSettlementJob() {
  cron.schedule(process.env.COMMISSION_SETTLEMENT_CRON_SCHEDULE || "0 3 * * *", () => {
    settleAgentCommissions();
  }, {
    scheduled: true,
    timezone: "Asia/Taipei" // 可根據實際需求調整時區
  });
  console.log("[CommissionSettlementJob] 分潤結算排程任務已啟動。");
}

module.exports = {
  startCommissionSettlementJob,
  settleAgentCommissions, // 暴露出來方便測試
};
