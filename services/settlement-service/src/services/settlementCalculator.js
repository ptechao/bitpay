/**
 * @file services/settlement-service/src/services/settlementCalculator.js
 * @description 計算指定時間範圍內的交易匯總，並扣除手續費。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");
const BigNumber = require("bignumber.js"); // 用於精確計算，避免浮點數問題

/**
 * 計算指定商戶、幣種和時間範圍內的交易匯總。
 * @param {string} merchantId - 商戶 ID
 * @param {string} currency - 幣種
 * @param {Date} startDate - 開始日期 (包含)
 * @param {Date} endDate - 結束日期 (包含)
 * @returns {Promise<{totalAmount: BigNumber, totalFee: BigNumber, netAmount: BigNumber, transactions: Array<object>}>}
 */
async function calculateSettlement(merchantId, currency, startDate, endDate) {
  let totalAmount = new BigNumber(0);
  let totalFee = new BigNumber(0);
  let netAmount = new BigNumber(0);
  const transactions = [];

  // 獲取商戶的費率配置
  const merchantFeeConfig = await knex("merchant_channel_configs")
    .where({ merchant_id: merchantId, currency_code: currency, status: "active" })
    .first();

  if (!merchantFeeConfig) {
    console.warn(`[SettlementCalculator] 商戶 ${merchantId} 無 ${currency} 的活躍費率配置，將使用預設費率 0。`);
    // 可以選擇拋出錯誤或使用預設值
    // throw new Error(`商戶 ${merchantId} 無 ${currency} 的活躍費率配置。`);
  }

  // 查詢指定時間範圍內，狀態為 SUCCESS 且未結算的交易
  // 這裡假設 transactions 表有一個 settlement_id 欄位來標記是否已結算
  const successfulTransactions = await knex("transactions")
    .where({ merchant_id: merchantId, currency: currency, status: "SUCCESS" })
    .andWhere("created_at", ">=", startDate.toISOString())
    .andWhere("created_at", "<=", endDate.toISOString())
    .andWhere(function() {
      this.whereNull("settlement_id"); // 尚未結算的交易
    })
    .select("id", "amount", "metadata"); // metadata 可能包含原始交易手續費資訊

  for (const tx of successfulTransactions) {
    const transactionAmount = new BigNumber(tx.amount);
    let transactionFee = new BigNumber(0);

    // 根據配置計算手續費
    if (merchantFeeConfig) {
      const feeRate = new BigNumber(merchantFeeConfig.fee_rate || 0);
      const fixedFee = new BigNumber(merchantFeeConfig.fixed_fee || 0);

      // 這裡可以擴展以支援更複雜的費率結構 (例如階梯費率)
      // 目前只處理百分比和固定金額
      transactionFee = transactionAmount.times(feeRate).plus(fixedFee);
    }

    totalAmount = totalAmount.plus(transactionAmount);
    totalFee = totalFee.plus(transactionFee);
    netAmount = netAmount.plus(transactionAmount.minus(transactionFee));

    transactions.push({
      id: tx.id,
      amount: transactionAmount.toFixed(4),
      fee_amount: transactionFee.toFixed(4), // 將計算出的手續費附加到交易物件中
    });
  }

  return {
    totalAmount,
    totalFee,
    netAmount,
    transactions,
  };
}

module.exports = {
  calculateSettlement,
};
