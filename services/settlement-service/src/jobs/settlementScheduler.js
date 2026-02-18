/**
 * @file services/settlement-service/src/jobs/settlementScheduler.js
 * @description 根據商戶的結算週期設定（D+0 到 T+30）自動生成結算單。
 * @author Manus AI
 * @date 2026-02-19
 */

const cron = require("node-cron");
const knex = require("../config/database");
const settlementCalculator = require("../services/settlementCalculator");
const { v4: uuidv4 } = require("uuid");

/**
 * 根據結算週期類型獲取結算日期範圍
 * @param {string} cycleType - 結算週期類型 (D+N, T+N)
 * @param {number} cycleValue - 結算週期值 N
 * @param {Date} referenceDate - 參考日期 (通常是交易日期或當前日期)
 * @returns {{startDate: Date, endDate: Date}}
 */
function getSettlementDateRange(cycleType, cycleValue, referenceDate) {
  const startDate = new Date(referenceDate);
  const endDate = new Date(referenceDate);

  if (cycleType === "D") {
    // D+N: 按自然日計算，N 天後結算
    startDate.setDate(startDate.getDate() - cycleValue);
    endDate.setDate(endDate.getDate() - cycleValue);
  } else if (cycleType === "T") {
    // T+N: 按交易日計算，N 個工作日後結算 (簡化處理，暫時按自然日計算)
    // 實際應用中需要考慮工作日邏輯，例如跳過週末和節假日
    startDate.setDate(startDate.getDate() - cycleValue);
    endDate.setDate(endDate.getDate() - cycleValue);
  } else {
    throw new Error(`不支援的結算週期類型: ${cycleType}`);
  }

  // 將時間部分歸零，只保留日期
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * 生成商戶結算單
 * @param {object} merchant - 商戶物件
 * @param {Date} settlementDate - 結算日期
 */
async function generateMerchantSettlement(merchant, settlementDate) {
  console.log(`[SettlementScheduler] 正在為商戶 ${merchant.id} (${merchant.name}) 生成 ${settlementDate.toISOString().split('T')[0]} 的結算單...`);

  const { settlement_cycle_type, settlement_cycle_value } = merchant;
  const { startDate, endDate } = getSettlementDateRange(
    settlement_cycle_type,
    settlement_cycle_value,
    settlementDate
  );

  // 獲取商戶所有支援的幣種
  const currencies = await knex("merchant_channel_configs")
    .where({ merchant_id: merchant.id, status: "active" })
    .distinct("currency_code")
    .pluck("currency_code");

  for (const currency of currencies) {
    try {
      const { totalAmount, totalFee, netAmount, transactions } = await settlementCalculator.calculateSettlement(
        merchant.id,
        currency,
        startDate,
        endDate
      );

      if (totalAmount.isGreaterThan(0) || totalFee.isGreaterThan(0)) { // 只有當有交易或手續費時才生成結算單
        const settlementId = uuidv4();
        const settlementBatchId = `SETTLEMENT-${settlementDate.toISOString().split('T')[0]}-${merchant.id.substring(0, 8)}-${currency}`;

        await knex.transaction(async trx => {
          // 插入結算單主表
          await trx("settlements").insert({
            id: settlementId,
            merchant_id: merchant.id,
            settlement_batch_id: settlementBatchId,
            total_amount: totalAmount.toFixed(4),
            fee_amount: totalFee.toFixed(4),
            net_amount: netAmount.toFixed(4),
            currency: currency,
            status: "pending", // 初始狀態為 pending
            settlement_date: settlementDate.toISOString().split('T')[0],
          });

          // 插入結算單詳情表
          const settlementDetails = transactions.map(tx => ({
            settlement_id: settlementId,
            transaction_id: tx.id,
            amount: tx.amount,
            fee: tx.fee_amount || 0, // 假設交易中已計算好單筆手續費
          }));
          if (settlementDetails.length > 0) {
            await trx("settlement_details").insert(settlementDetails);
          }

          // 更新已結算交易的狀態或標記
          // 這裡假設 transactions 表有一個 settlement_id 欄位來標記已結算
          if (transactions.length > 0) {
            const transactionIds = transactions.map(tx => tx.id);
            await trx("transactions")
              .whereIn("id", transactionIds)
              .update({ settlement_id: settlementId, updated_at: knex.fn.now() });
          }
        });

        console.log(`[SettlementScheduler] 商戶 ${merchant.id} 的 ${currency} 結算單 ${settlementBatchId} 已生成。`);
      } else {
        console.log(`[SettlementScheduler] 商戶 ${merchant.id} 在 ${startDate.toISOString().split('T')[0]} 到 ${endDate.toISOString().split('T')[0]} 期間無 ${currency} 交易，跳過結算單生成。`);
      }
    } catch (error) {
      console.error(`[SettlementScheduler] 為商戶 ${merchant.id} 生成 ${currency} 結算單失敗:`, error);
    }
  }
}

/**
 * 執行每日結算排程
 */
async function runDailySettlement() {
  console.log(`[SettlementScheduler] 每日結算排程開始執行...`);
  const today = new Date();

  try {
    // 獲取所有活躍商戶及其結算配置
    const merchants = await knex("merchants")
      .where({ status: "active" })
      .select("id", "name", "settlement_cycle_type", "settlement_cycle_value");

    for (const merchant of merchants) {
      await generateMerchantSettlement(merchant, today);
    }
    console.log(`[SettlementScheduler] 每日結算排程執行完畢。`);
  } catch (error) {
    console.error("[SettlementScheduler] 執行每日結算排程時發生錯誤:", error);
  }
}

/**
 * 啟動結算排程任務
 * 預設每天凌晨 2 點執行一次
 */
function startSettlementScheduler() {
  cron.schedule(process.env.SETTLEMENT_CRON_SCHEDULE || "0 2 * * *", () => {
    runDailySettlement();
  }, {
    scheduled: true,
    timezone: "Asia/Taipei" // 可根據實際需求調整時區
  });
  console.log("[SettlementScheduler] 結算排程任務已啟動。");
}

module.exports = {
  startSettlementScheduler,
  runDailySettlement, // 暴露出來方便測試
};
