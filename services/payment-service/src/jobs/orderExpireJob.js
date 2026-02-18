/**
 * @file services/payment-service/src/jobs/orderExpireJob.js
 * @description 定時掃描超時未支付的訂單，自動標記為 EXPIRED。
 * @author Manus AI
 * @date 2026-02-19
 */

const cron = require("node-cron");
const knex = require("../config/database");
const orderStateMachine = require("../stateMachine/orderStateMachine");

const EXPIRATION_TIME_SECONDS = process.env.ORDER_EXPIRATION_TIME_SECONDS || 3600; // 預設 1 小時

/**
 * 掃描並處理超時訂單
 */
async function scanAndExpireOrders() {
  console.log(`[OrderExpireJob] 開始掃描超時訂單...`);
  const now = new Date();
  const expirationThreshold = new Date(now.getTime() - EXPIRATION_TIME_SECONDS * 1000);

  try {
    const expiredOrders = await knex("transactions")
      .where("status", orderStateMachine.states.PENDING)
      .andWhere("created_at", "<", expirationThreshold)
      .select("id");

    if (expiredOrders.length > 0) {
      console.log(`[OrderExpireJob] 發現 ${expiredOrders.length} 筆超時訂單，準備處理...`);
      for (const order of expiredOrders) {
        try {
          await orderStateMachine.transition(
            order.id,
            orderStateMachine.states.EXPIRED,
            "訂單超時未支付自動過期"
          );
          console.log(`[OrderExpireJob] 訂單 ${order.id} 已成功標記為 EXPIRED。`);
        } catch (error) {
          console.error(`[OrderExpireJob] 處理訂單 ${order.id} 過期失敗:`, error.message);
        }
      }
    } else {
      console.log(`[OrderExpireJob] 未發現超時訂單。`);
    }
  } catch (error) {
    console.error("[OrderExpireJob] 掃描超時訂單時發生錯誤:", error);
  }
}

/**
 * 啟動訂單過期排程任務
 * 預設每 5 分鐘執行一次
 */
function startOrderExpireJob() {
  // 排程表達式：秒 分 時 日 月 星期
  // 例如：'*/5 * * * *' 表示每 5 分鐘執行一次
  cron.schedule(process.env.ORDER_EXPIRE_CRON_SCHEDULE || '*/5 * * * *', () => {
    scanAndExpireOrders();
  }, {
    scheduled: true,
    timezone: "Asia/Taipei" // 可根據實際需求調整時區
  });
  console.log("[OrderExpireJob] 訂單過期排程任務已啟動。");
}

module.exports = {
  startOrderExpireJob,
  scanAndExpireOrders // 暴露出來方便測試
};
