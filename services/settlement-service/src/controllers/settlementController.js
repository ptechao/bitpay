// 檔案：src/controllers/settlementController.js
// 說明：處理結算服務的 API 請求，包括查詢結算單、手動觸發結算、發起提現和查詢提現記錄。

const SettlementService = require("../services/settlementService");
const SettlementModel = require("../models/settlementModel");

class SettlementController {
  /**
   * 查詢結算單（商戶或代理）
   * GET /api/v1/settlements/:entityType/:entityId
   */
  static async getSettlements(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const filters = req.query; // 獲取查詢參數作為過濾條件

      const settlements = await SettlementModel.getSettlements(entityType, parseInt(entityId), filters);
      res.status(200).json({ settlements });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 手動觸發結算
   * POST /api/v1/settlements/trigger
   */
  static async triggerSettlement(req, res, next) {
    try {
      const { entityType, entityId, settlementDate } = req.body;

      if (!entityType || !entityId || !settlementDate) {
        return res.status(400).json({ message: "缺少必要的參數：entityType, entityId, settlementDate" });
      }

      const result = await SettlementService.executeSettlement(entityType, parseInt(entityId), new Date(settlementDate));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 發起提現
   * POST /api/v1/withdrawals
   */
  static async initiateWithdrawal(req, res, next) {
    try {
      const { entityType, entityId, currencyCode, amount, bankName, accountName, accountNumber, cryptoWalletAddress } = req.body;

      if (!entityType || !entityId || !currencyCode || !amount) {
        return res.status(400).json({ message: "缺少必要的參數：entityType, entityId, currencyCode, amount" });
      }

      const newWithdrawal = await SettlementService.initiateWithdrawal({
        entityType,
        entityId: parseInt(entityId),
        currencyCode,
        amount,
        bankName,
        accountName,
        accountNumber,
        cryptoWalletAddress,
      });

      res.status(201).json({ message: "提現申請成功", withdrawal: newWithdrawal });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢提現記錄
   * GET /api/v1/withdrawals/:withdrawalId
   */
  static async getWithdrawalRecord(req, res, next) {
    try {
      const { withdrawalId } = req.params;
      const withdrawal = await SettlementModel.getWithdrawalById(parseInt(withdrawalId));

      if (!withdrawal) {
        return res.status(404).json({ message: "提現記錄不存在" });
      }

      res.status(200).json({ withdrawal });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 結算報表
   * GET /api/v1/settlements/:entityType/:entityId/reports
   */
  static async getSettlementReports(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const filters = req.query; // 獲取查詢參數作為過濾條件

      const reports = await SettlementService.getSettlementReports(entityType, parseInt(entityId), filters);
      res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettlementController;
