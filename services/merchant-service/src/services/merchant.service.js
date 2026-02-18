
/**
 * @fileoverview 商戶服務
 * @description 處理商戶相關的業務邏輯，包括註冊、查詢、更新、支付配置和結算週期設定。
 */

const Merchant = require("../models/merchant.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

class MerchantService {
  /**
   * 商戶註冊
   * @param {object} userData - 使用者註冊資料 (username, email, password, phoneNumber)
   * @param {object} merchantData - 商戶詳細資料 (name, legalName, contactPerson, contactEmail, address, website, parentAgentId)
   * @returns {Promise<object>} 註冊成功的商戶資料
   */
  static async registerMerchant(userData, merchantData) {
    const { username, email, password, phoneNumber } = userData;

    // 檢查使用者名稱或電子郵件是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      throw new Error("使用者名稱已存在");
    }
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new Error("電子郵件已存在");
    }

    // 密碼雜湊
    const passwordHash = await bcrypt.hash(password, 10);

    // 建立使用者
    const newUser = await User.create({
      username,
      passwordHash,
      email,
      phoneNumber,
      userType: "merchant",
    });

    // 建立商戶
    const newMerchant = await Merchant.create({
      userId: newUser.id,
      name: merchantData.name,
      legalName: merchantData.legalName,
      contactPerson: merchantData.contactPerson,
      contactEmail: merchantData.contactEmail || email, // 如果商戶聯絡郵件未提供，則使用使用者郵件
      phoneNumber: merchantData.phoneNumber || phoneNumber, // 如果商戶聯絡電話未提供，則使用使用者電話
      address: merchantData.address,
      website: merchantData.website,
      parentAgentId: merchantData.parentAgentId,
    });

    return { user: newUser, merchant: newMerchant };
  }

  /**
   * 查詢商戶資訊
   * @param {number} merchantId - 商戶 ID
   * @returns {Promise<object>} 商戶資料
   */
  static async getMerchantInfo(merchantId) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("商戶不存在");
    }
    return merchant;
  }

  /**
   * 更新商戶資訊
   * @param {number} merchantId - 商戶 ID
   * @param {object} updateData - 欲更新的商戶資料
   * @returns {Promise<object>} 更新後的商戶資料
   */
  static async updateMerchantInfo(merchantId, updateData) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("商戶不存在");
    }
    const updatedMerchant = await Merchant.update(merchantId, updateData);
    return updatedMerchant;
  }

  /**
   * 配置商戶支付參數
   * @param {number} merchantId - 商戶 ID
   * @param {object} paymentConfigData - 支付配置資料
   * @returns {Promise<object>} 配置資料
   */
  static async configurePayment(merchantId, paymentConfigData) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("商戶不存在");
    }
    const config = await Merchant.configurePayment({ merchantId, ...paymentConfigData });
    return config;
  }

  /**
   * 查詢商戶交易記錄
   * @param {number} merchantId - 商戶 ID
   * @param {object} filters - 過濾條件
   * @returns {Promise<Array<object>>} 交易記錄列表
   */
  static async getMerchantTransactions(merchantId, filters) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("商戶不存在");
    }
    const transactions = await Merchant.getTransactions(merchantId, filters);
    return transactions;
  }

  /**
   * 設定商戶結算週期
   * @param {number} merchantId - 商戶 ID
   * @param {object} settlementConfigData - 結算配置資料 (settlementCycle, currencyCode, settlementAccount)
   * @returns {Promise<object>} 配置資料
   */
  static async setMerchantSettlementConfig(merchantId, settlementConfigData) {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("商戶不存在");
    }
    const config = await Merchant.setSettlementConfig({ merchantId, ...settlementConfigData });
    return config;
  }
}

module.exports = MerchantService;
