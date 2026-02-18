// src/services/channelService.js
/**
 * @file 通道管理服務業務邏輯
 * @description 包含通道配置管理、費率管理、通道監控、通道切換、一個通道支援多幣種等核心業務邏輯。
 * @author Manus AI
 */

const PaymentChannel = require("../models/PaymentChannel");
const ChannelCurrencyConfig = require("../models/ChannelCurrencyConfig");
const { getRedisClient } = require("../config/redis");

const CHANNELS_CACHE_KEY = "payment_channels";

class ChannelService {
  constructor() {
    this.redisClient = getRedisClient();
    this.loadChannelsToCache();
  }

  /**
   * 從資料庫載入所有支付通道及其幣種配置到 Redis 快取
   */
  async loadChannelsToCache() {
    try {
      const channels = await PaymentChannel.findAllWithCurrencies();
      await this.redisClient.set(CHANNELS_CACHE_KEY, JSON.stringify(channels));
      console.log("支付通道已載入到 Redis 快取");
    } catch (error) {
      console.error("載入支付通道到 Redis 失敗:", error);
    }
  }

  /**
   * 獲取所有支付通道及其支援的幣種
   * @returns {Promise<Array<object>>} 支付通道陣列
   */
  async getAllChannels() {
    const cachedChannels = await this.redisClient.get(CHANNELS_CACHE_KEY);
    if (cachedChannels) {
      return JSON.parse(cachedChannels);
    }
    const channels = await PaymentChannel.findAllWithCurrencies();
    await this.redisClient.set(CHANNELS_CACHE_KEY, JSON.stringify(channels));
    return channels;
  }

  /**
   * 根據 ID 獲取通道詳情及其支援的幣種
   * @param {number} channelId - 通道 ID
   * @returns {Promise<object|null>} 通道詳情或 null
   */
  async getChannelDetails(channelId) {
    const channels = await this.getAllChannels();
    const channel = channels.find(c => c.id === parseInt(channelId));
    return channel || null;
  }

  /**
   * 新增支付通道
   * @param {object} channelData - 通道資料
   * @returns {Promise<object>} 新增的通道
   */
  async createChannel(channelData) {
    const newChannel = await PaymentChannel.create(channelData);
    await this.loadChannelsToCache(); // 更新快取
    return newChannel;
  }

  /**
   * 更新通道配置
   * @param {number} channelId - 通道 ID
   * @param {object} updateData - 更新資料
   * @returns {Promise<object|null>} 更新後的通道或 null
   */
  async updateChannel(channelId, updateData) {
    const updatedChannel = await PaymentChannel.update(channelId, updateData);
    await this.loadChannelsToCache(); // 更新快取
    return updatedChannel;
  }

  /**
   * 停用通道 (邏輯刪除)
   * @param {number} channelId - 通道 ID
   * @returns {Promise<object|null>} 停用的通道或 null
   */
  async deactivateChannel(channelId) {
    const deactivatedChannel = await PaymentChannel.update(channelId, { status: "inactive" });
    await this.loadChannelsToCache(); // 更新快取
    return deactivatedChannel;
  }

  /**
   * 查詢通道支援的幣種
   * @param {number} channelId - 通道 ID
   * @returns {Promise<Array<object>>} 幣種配置陣列
   */
  async getChannelCurrencies(channelId) {
    const channel = await this.getChannelDetails(channelId);
    if (!channel) {
      return null;
    }
    return channel.currencies.filter(c => c.id !== null); // 過濾掉 json_agg 可能產生的 null 項目
  }

  /**
   * 配置通道支援的幣種
   * @param {number} channelId - 通道 ID
   * @param {Array<object>} currencyConfigs - 幣種配置陣列
   * @returns {Promise<Array<object>>} 配置後的幣種陣列
   */
  async configureChannelCurrencies(channelId, currencyConfigs) {
    const configuredCurrencies = [];
    for (const config of currencyConfigs) {
      const { currency_code, ...data } = config;
      const upsertedConfig = await ChannelCurrencyConfig.upsert(channelId, currency_code, data);
      configuredCurrencies.push(upsertedConfig);
    }
    await this.loadChannelsToCache(); // 更新快取
    return configuredCurrencies;
  }

  /**
   * 獲取通道健康狀態
   * @returns {Promise<Array<object>>} 通道健康狀態列表
   */
  async getChannelStatus() {
    const channels = await this.getAllChannels();
    // 這裡可以加入更複雜的邏輯來判斷通道的實時健康狀態
    // 例如：ping 外部 API、檢查最近交易成功率等
    return channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      code: channel.code,
      status: channel.status, // 假設 status 字段能反映健康狀態
      last_checked: new Date().toISOString(),
      // 更多健康指標...
    }));
  }
}

module.exports = new ChannelService();
