// 檔案：src/jobs/settlementJob.js
// 說明：定義自動結算排程任務，定期觸發結算服務的結算邏輯。

const cron = require("node-cron");
const SettlementService = require("../services/settlementService");
const { query } = require("../config/db");

// 自動結算任務
const startSettlementJob = () => {
  // 每天凌晨 2 點執行結算任務
  cron.schedule("0 2 * * *", async () => {
    console.log("開始執行自動結算任務...");
    try {
      // 獲取所有活躍的商戶和代理
      const merchantsRes = await query("SELECT id FROM merchants WHERE status = $1", ["active"]);
      const agentsRes = await query("SELECT id FROM agents WHERE status = $1", ["active"]);

      const settlementDate = new Date(); // 當前日期作為結算日期

      // 對每個商戶執行結算
      for (const merchant of merchantsRes.rows) {
        console.log(`對商戶 ${merchant.id} 執行結算...`);
        await SettlementService.executeSettlement("merchant", merchant.id, settlementDate);
      }

      // 對每個代理執行結算
      for (const agent of agentsRes.rows) {
        console.log(`對代理 ${agent.id} 執行結算...`);
        await SettlementService.executeSettlement("agent", agent.id, settlementDate);
      }

      console.log("自動結算任務執行完成。");
    } catch (error) {
      console.error("自動結算任務執行失敗:", error);
    }
  });
};

module.exports = { startSettlementJob };
