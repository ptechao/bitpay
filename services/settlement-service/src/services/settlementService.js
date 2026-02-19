// 檔案：src/services/settlementService.js
// 說明：處理結算服務的業務邏輯，包括交易清算、對帳、商戶結算、代理分潤結算、D+0~T+30 結算週期處理和提現處理。

const SettlementModel = require("../models/settlementModel");
const knex = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class SettlementService {
  /**
   * 執行結算邏輯
   * @param {string} entityType - 實體類型 (merchant 或 agent)
   * @param {number} entityId - 實體 ID
   * @param {Date} settlementDate - 結算日期 (D+0 的 D)
   * @returns {Promise<object>} 結算結果
   */
  static async executeSettlement(entityType, entityId, settlementDate) {
    // 獲取實體的結算週期配置
    const config = await SettlementModel.getEntitySettlementConfig(entityType, entityId);
    const settlementCycle = config.settlementCycle; // 例如: D+1, T+3

    // 計算實際的結算開始和結束日期
    const { startDate, endDate } = this._calculateSettlementPeriod(settlementDate, settlementCycle);

    // 檢查是否已經存在該週期的結算單
    const existingSettlements = await SettlementModel.getSettlements(entityType, entityId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'completed'
    });

    if (existingSettlements.length > 0) {
      console.log(`實體 ${entityType}:${entityId} 在 ${startDate.toISOString().split('T')[0]} 到 ${endDate.toISOString().split('T')[0]} 期間已有完成的結算單，跳過。`);
      return { message: "已有完成的結算單", settlement: existingSettlements[0] };
    }

    // 獲取所有相關的支付訂單
    const paymentOrders = await SettlementModel.getPaymentOrdersForSettlement(entityType, entityId, startDate, endDate);

    // 處理多幣種結算
    const settlementsByCurrency = {};

    for (const order of paymentOrders) {
      if (!settlementsByCurrency[order.currency_code]) {
        settlementsByCurrency[order.currency_code] = {
          totalIncome: 0,
          totalFee: 0,
          totalRefund: 0,
          netAmount: 0,
          orderIds: [],
          commissionIds: []
        };
      }

      // 這裡需要根據實際業務邏輯計算商戶的淨收入和手續費
      // 假設 order.amount 是總收入，order.fee 是商戶應付手續費
      settlementsByCurrency[order.currency_code].totalIncome += parseFloat(order.amount);
      settlementsByCurrency[order.currency_code].totalFee += parseFloat(order.fee);
      // 這裡需要考慮退款邏輯，目前簡化處理
      settlementsByCurrency[order.currency_code].netAmount += parseFloat(order.amount) - parseFloat(order.fee);
      settlementsByCurrency[order.currency_code].orderIds.push(order.id);
    }

    // 如果是代理，還需要處理分潤記錄
    if (entityType === "agent") {
      const commissionRecords = await SettlementModel.getPendingCommissionRecords(entityId, endDate);
      for (const record of commissionRecords) {
        if (!settlementsByCurrency[record.currency_code]) {
          settlementsByCurrency[record.currency_code] = {
            totalIncome: 0,
            totalFee: 0,
            totalRefund: 0,
            netAmount: 0,
            orderIds: [],
            commissionIds: []
          };
        }
        // 代理的分潤是收入，不計入 totalIncome 和 totalFee，直接影響 netAmount
        settlementsByCurrency[record.currency_code].netAmount += parseFloat(record.commission_amount);
        settlementsByCurrency[record.currency_code].commissionIds.push(record.id);
      }
    }

    const createdSettlements = [];
    for (const currencyCode in settlementsByCurrency) {
      const settlementData = settlementsByCurrency[currencyCode];
      if (settlementData.orderIds.length === 0 && settlementData.commissionIds.length === 0) {
        continue; // 沒有需要結算的交易
      }

      const settlementSn = `SET-${uuidv4()}`;
      const newSettlement = await SettlementModel.createSettlement({
        settlementSn,
        entityType,
        entityId,
        currencyCode,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalIncome: settlementData.totalIncome,
        totalFee: settlementData.totalFee,
        totalRefund: settlementData.totalRefund,
        netAmount: settlementData.netAmount,
        status: "completed", // 假設結算完成後直接標記為 completed
      });
      createdSettlements.push(newSettlement);

      // 更新支付訂單和分潤記錄的結算 ID 和狀態
      await SettlementModel.updatePaymentOrdersSettlementStatus(settlementData.orderIds, newSettlement.id);
      await SettlementModel.updateCommissionRecordsSettlementStatus(settlementData.commissionIds, newSettlement.id);
    }

    return { message: "結算執行成功", settlements: createdSettlements };
  }

  /**
   * 計算結算週期
   * @param {Date} settlementDate - 結算日期 (D+0 的 D)
   * @param {string} settlementCycle - 結算週期，例如 "D+1", "T+3", "D+0"
   * @returns {{startDate: Date, endDate: Date}} 結算週期的開始和結束日期
   */
  static _calculateSettlementPeriod(settlementDate, settlementCycle) {
    const today = new Date(settlementDate);
    today.setHours(0, 0, 0, 0);

    let daysOffset = 0;
    const cycleParts = settlementCycle.match(/([DT])\+(\d+)/);
    if (cycleParts) {
      const type = cycleParts[1]; // D or T
      const offset = parseInt(cycleParts[2]);

      if (type === 'D') {
        daysOffset = offset;
      } else if (type === 'T') {
        // T+N 結算通常指交易日後的第 N 天，這裡簡化為 D+N
        daysOffset = offset;
      }
    } else if (settlementCycle === 'D+0') {
      daysOffset = 0;
    }

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - daysOffset);
    endDate.setHours(23, 59, 59, 999); // 結算到當天結束

    // 結算週期通常指結算日期的前一個週期。例如，D+1 結算，今天結算的是昨天的數據。
    // 如果 settlementDate 是 D，D+N 結算的是 D-N 的數據。
    // 這裡的 endDate 已經是實際結算週期的結束日期。
    // 假設結算週期為一天，則 startDate = endDate。
    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
  }

  /**
   * 發起提現
   * @param {object} withdrawalData - 提現資料
   * @returns {Promise<object>} 新創建的提現記錄
   */
  static async initiateWithdrawal(withdrawalData) {
    const { entityType, entityId, currencyCode, amount, bankName, accountName, accountNumber, cryptoWalletAddress } = withdrawalData;

    // 檢查餘額是否足夠 (這裡需要從結算表中查詢實體的淨餘額)
    // 簡化處理，實際需要更複雜的餘額檢查邏輯
    const currentBalance = await this.getEntityBalance(entityType, entityId, currencyCode);
    if (currentBalance < amount) {
      throw new Error("餘額不足");
    }

    const withdrawalSn = `WDL-${uuidv4()}`;
    const fee = 0; // 提現手續費，實際應從配置中獲取
    const actualAmount = amount - fee;

    const newWithdrawal = await SettlementModel.createWithdrawal({
      withdrawalSn,
      entityType,
      entityId,
      currencyCode,
      amount,
      fee,
      actualAmount,
      bankName,
      accountName,
      accountNumber,
      cryptoWalletAddress,
      status: "pending",
    });

    // 更新實體餘額 (從待提現中扣除)
    // 實際需要一個更精確的帳戶餘額管理系統

    return newWithdrawal;
  }

  /**
   * 獲取實體餘額 (簡化版)
   * 實際應從一個專門的帳戶餘額表中獲取
   * @param {string} entityType - 實體類型
   * @param {number} entityId - 實體 ID
   * @param {string} currencyCode - 幣種
   * @returns {Promise<number>} 餘額
   */
  static async getEntityBalance(entityType, entityId, currencyCode) {
    const res = await query(
      `SELECT SUM(net_amount) as balance FROM settlements WHERE entity_type = $1 AND entity_id = $2 AND currency_code = $3 AND status = 'completed'`,
      [entityType, entityId, currencyCode]
    );
    return parseFloat(res.rows[0].balance || 0);
  }

  /**
   * 獲取結算報表
   * @param {string} entityType - 實體類型
   * @param {number} entityId - 實體 ID
   * @param {object} filters - 過濾條件 (例如：startDate, endDate, currencyCode)
   * @returns {Promise<object>} 結算報表數據
   */
  static async getSettlementReports(entityType, entityId, filters = {}) {
    const settlements = await SettlementModel.getSettlements(entityType, entityId, filters);

    // 這裡可以對 settlements 數據進行進一步的統計和格式化，生成報表
    // 簡化處理，直接返回原始結算數據
    return { reports: settlements };
  }
}

module.exports = SettlementService;
