// src/controllers/riskController.js
/**
 * @file 風控服務控制器
 * @description 處理風控相關的 HTTP 請求，調用 RiskService 執行業務邏輯。
 * @author Manus AI
 */

const riskService = require("../services/riskService");

/**
 * 提交交易進行風控審核
 * @route POST /api/v1/risk/evaluate
 * @param {object} req.body - 交易資料
 * @returns {object} 風險評估結果
 */
const evaluateTransaction = async (req, res, next) => {
  try {
    const transactionData = req.body;
    const result = await riskService.evaluateTransaction(transactionData);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢風控規則
 * @route GET /api/v1/risk/rules
 * @returns {Array<object>} 風控規則列表
 */
const getRiskRules = async (req, res, next) => {
  try {
    const rules = await riskService.getRules();
    res.status(200).json({ status: "success", data: rules });
  } catch (error) {
    next(error);
  }
};

/**
 * 配置風控規則
 * @route PUT /api/v1/risk/rules
 * @param {Array<object>} req.body - 新的風控規則陣列
 * @returns {Array<object>} 更新後的風控規則列表
 */
const updateRiskRules = async (req, res, next) => {
  try {
    const newRules = req.body;
    const updatedRules = await riskService.updateRules(newRules);
    res.status(200).json({ status: "success", data: updatedRules });
  } catch (error) {
    next(error);
  }
};

/**
 * 新增黑名單項目
 * @route POST /api/v1/risk/blacklist
 * @param {object} req.body - 黑名單項目資料
 * @returns {object} 新增的黑名單項目
 */
const addBlacklistItem = async (req, res, next) => {
  try {
    const item = req.body;
    const newBlacklistItem = await riskService.addBlacklistItem(item);
    res.status(201).json({ status: "success", data: newBlacklistItem });
  } catch (error) {
    next(error);
  }
};

/**
 * 移除黑名單項目
 * @route DELETE /api/v1/risk/blacklist/:id
 * @param {string} req.params.id - 黑名單項目 ID
 * @returns {object} 移除的黑名單項目
 */
const removeBlacklistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removedItem = await riskService.removeBlacklistItem(id);
    if (!removedItem) {
      return res.status(404).json({ status: "fail", message: "黑名單項目未找到" });
    }
    res.status(200).json({ status: "success", data: removedItem });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢黑名單列表
 * @route GET /api/v1/risk/blacklist
 * @returns {Array<object>} 黑名單列表
 */
const getBlacklist = async (req, res, next) => {
  try {
    const blacklist = await riskService.getBlacklist();
    res.status(200).json({ status: "success", data: blacklist });
  } catch (error) {
    next(error);
  }
};

/**
 * 新增白名單項目
 * @route POST /api/v1/risk/whitelist
 * @param {object} req.body - 白名單項目資料
 * @returns {object} 新增的白名單項目
 */
const addWhitelistItem = async (req, res, next) => {
  try {
    const item = req.body;
    const newWhitelistItem = await riskService.addWhitelistItem(item);
    res.status(201).json({ status: "success", data: newWhitelistItem });
  } catch (error) {
    next(error);
  }
};

/**
 * 移除白名單項目
 * @route DELETE /api/v1/risk/whitelist/:id
 * @param {string} req.params.id - 白名單項目 ID
 * @returns {object} 移除的白名單項目
 */
const removeWhitelistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removedItem = await riskService.removeWhitelistItem(id);
    if (!removedItem) {
      return res.status(404).json({ status: "fail", message: "白名單項目未找到" });
    }
    res.status(200).json({ status: "success", data: removedItem });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateTransaction,
  getRiskRules,
  updateRiskRules,
  addBlacklistItem,
  removeBlacklistItem,
  getBlacklist,
  addWhitelistItem,
  removeWhitelistItem,
  getWhitelist,
};
