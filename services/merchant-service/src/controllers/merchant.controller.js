
/**
 * @fileoverview 商戶控制器
 * @description 處理商戶相關的 HTTP 請求，並呼叫對應的業務邏輯服務。
 */

const MerchantService = require("../services/merchant.service");

class MerchantController {
  /**
   * 商戶註冊
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async registerMerchant(req, res, next) {
    try {
      const { username, email, password, phoneNumber, name, legalName, contactPerson, address, website, parentAgentId } = req.body;
      const userData = { username, email, password, phoneNumber };
      const merchantData = { name, legalName, contactPerson, contactEmail: email, phoneNumber, address, website, parentAgentId };
      const result = await MerchantService.registerMerchant(userData, merchantData);
      res.status(201).json({ message: "商戶註冊成功", data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢商戶資訊
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async getMerchantInfo(req, res, next) {
    try {
      const { merchantId } = req.params;
      const merchant = await MerchantService.getMerchantInfo(merchantId);
      res.status(200).json({ message: "商戶資訊查詢成功", data: merchant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新商戶資訊
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async updateMerchantInfo(req, res, next) {
    try {
      const { merchantId } = req.params;
      const updateData = req.body;
      const updatedMerchant = await MerchantService.updateMerchantInfo(merchantId, updateData);
      res.status(200).json({ message: "商戶資訊更新成功", data: updatedMerchant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 配置支付參數
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async configurePayment(req, res, next) {
    try {
      const { merchantId } = req.params;
      const paymentConfigData = req.body;
      const config = await MerchantService.configurePayment(merchantId, paymentConfigData);
      res.status(200).json({ message: "支付參數配置成功", data: config });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢交易記錄
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async getTransactions(req, res, next) {
    try {
      const { merchantId } = req.params;
      const filters = req.query; // 假設過濾條件從 query string 傳入
      const transactions = await MerchantService.getMerchantTransactions(merchantId, filters);
      res.status(200).json({ message: "交易記錄查詢成功", data: transactions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 設定結算週期
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   * @param {function} next - Express next 中間件函數
   */
  static async setSettlementConfig(req, res, next) {
    try {
      const { merchantId } = req.params;
      const settlementConfigData = req.body;
      const config = await MerchantService.setMerchantSettlementConfig(merchantId, settlementConfigData);
      res.status(200).json({ message: "結算週期設定成功", data: config });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MerchantController;
