// src/controllers/channelController.js
/**
 * @file 通道管理服務控制器
 * @description 處理通道相關的 HTTP 請求，調用 ChannelService 執行業務邏輯。
 * @author Manus AI
 */

const channelService = require("../services/channelService");

/**
 * 新增支付通道
 * @route POST /api/v1/channels
 * @param {object} req.body - 通道資料
 * @returns {object} 新增的通道
 */
const createChannel = async (req, res, next) => {
  try {
    const channelData = req.body;
    const newChannel = await channelService.createChannel(channelData);
    res.status(201).json({ status: "success", data: newChannel });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢所有通道
 * @route GET /api/v1/channels
 * @returns {Array<object>} 所有通道列表
 */
const getAllChannels = async (req, res, next) => {
  try {
    const channels = await channelService.getAllChannels();
    res.status(200).json({ status: "success", data: channels });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢通道詳情
 * @route GET /api/v1/channels/:channelId
 * @param {string} req.params.channelId - 通道 ID
 * @returns {object} 通道詳情
 */
const getChannelDetails = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await channelService.getChannelDetails(channelId);
    if (!channel) {
      return res.status(404).json({ status: "fail", message: "通道未找到" });
    }
    res.status(200).json({ status: "success", data: channel });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新通道配置
 * @route PUT /api/v1/channels/:channelId
 * @param {string} req.params.channelId - 通道 ID
 * @param {object} req.body - 更新資料
 * @returns {object} 更新後的通道
 */
const updateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const updateData = req.body;
    const updatedChannel = await channelService.updateChannel(channelId, updateData);
    if (!updatedChannel) {
      return res.status(404).json({ status: "fail", message: "通道未找到" });
    }
    res.status(200).json({ status: "success", data: updatedChannel });
  } catch (error) {
    next(error);
  }
};

/**
 * 停用通道
 * @route DELETE /api/v1/channels/:channelId
 * @param {string} req.params.channelId - 通道 ID
 * @returns {object} 停用的通道
 */
const deactivateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const deactivatedChannel = await channelService.deactivateChannel(channelId);
    if (!deactivatedChannel) {
      return res.status(404).json({ status: "fail", message: "通道未找到" });
    }
    res.status(200).json({ status: "success", data: deactivatedChannel });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢通道支援的幣種
 * @route GET /api/v1/channels/:channelId/currencies
 * @param {string} req.params.channelId - 通道 ID
 * @returns {Array<object>} 幣種配置列表
 */
const getChannelCurrencies = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const currencies = await channelService.getChannelCurrencies(channelId);
    if (currencies === null) {
      return res.status(404).json({ status: "fail", message: "通道未找到" });
    }
    res.status(200).json({ status: "success", data: currencies });
  } catch (error) {
    next(error);
  }
};

/**
 * 配置通道支援的幣種
 * @route POST /api/v1/channels/:channelId/currencies
 * @param {string} req.params.channelId - 通道 ID
 * @param {Array<object>} req.body - 幣種配置陣列
 * @returns {Array<object>} 配置後的幣種列表
 */
const configureChannelCurrencies = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const currencyConfigs = req.body;
    const configuredCurrencies = await channelService.configureChannelCurrencies(channelId, currencyConfigs);
    res.status(200).json({ status: "success", data: configuredCurrencies });
  } catch (error) {
    next(error);
  }
};

/**
 * 查詢通道健康狀態
 * @route GET /api/v1/channels/status
 * @returns {Array<object>} 通道健康狀態列表
 */
const getChannelStatus = async (req, res, next) => {
  try {
    const status = await channelService.getChannelStatus();
    res.status(200).json({ status: "success", data: status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChannel,
  getAllChannels,
  getChannelDetails,
  updateChannel,
  deactivateChannel,
  getChannelCurrencies,
  configureChannelCurrencies,
  getChannelStatus,
};
