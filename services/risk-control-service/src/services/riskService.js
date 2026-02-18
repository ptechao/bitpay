// src/services/riskService.js
/**
 * @file 風控服務業務邏輯
 * @description 包含風控規則引擎、風險評分、黑白名單檢查、異常行為檢測等核心業務邏輯。
 * @author Manus AI
 */

const RiskRule = require("../models/RiskRule");
const Blacklist = require("../models/Blacklist");
const Whitelist = require("../models/Whitelist");
const { getRedisClient } = require("../config/redis");

const RISK_RULES_CACHE_KEY = "risk_rules";
const BLACKLIST_CACHE_KEY = "blacklist";
const WHITELIST_CACHE_KEY = "whitelist";

class RiskService {
  constructor() {
    this.redisClient = getRedisClient();
    this.loadRulesToCache();
    this.loadBlacklistToCache();
    this.loadWhitelistToCache();
  }

  /**
   * 從資料庫載入風控規則到 Redis 快取
   */
  async loadRulesToCache() {
    try {
      const rules = await RiskRule.findAll();
      await this.redisClient.set(RISK_RULES_CACHE_KEY, JSON.stringify(rules));
      console.log("風控規則已載入到 Redis 快取");
    } catch (error) {
      console.error("載入風控規則到 Redis 失敗:", error);
    }
  }

  /**
   * 從資料庫載入黑名單到 Redis 快取
   */
  async loadBlacklistToCache() {
    try {
      const blacklist = await Blacklist.findAll();
      await this.redisClient.set(BLACKLIST_CACHE_KEY, JSON.stringify(blacklist));
      console.log("黑名單已載入到 Redis 快取");
    } catch (error) {
      console.error("載入黑名單到 Redis 失敗:", error);
    }
  }

  /**
   * 從資料庫載入白名單到 Redis 快取
   */
  async loadWhitelistToCache() {
    try {
      const whitelist = await Whitelist.findAll();
      await this.redisClient.set(WHITELIST_CACHE_KEY, JSON.stringify(whitelist));
      console.log("白名單已載入到 Redis 快取");
    } catch (error) {
      console.error("載入白名單到 Redis 失敗:", error);
    }
  }

  /**
   * 獲取所有風控規則
   * @returns {Promise<Array<object>>} 風控規則陣列
   */
  async getRules() {
    const cachedRules = await this.redisClient.get(RISK_RULES_CACHE_KEY);
    if (cachedRules) {
      return JSON.parse(cachedRules);
    }
    const rules = await RiskRule.findAll();
    await this.redisClient.set(RISK_RULES_CACHE_KEY, JSON.stringify(rules));
    return rules;
  }

  /**
   * 更新風控規則
   * @param {Array<object>} newRules - 新的風控規則陣列
   * @returns {Promise<Array<object>>} 更新後的風控規則陣列
   */
  async updateRules(newRules) {
    // 這裡可以根據實際需求實現更複雜的更新邏輯，例如批量更新、刪除舊規則等
    // 為了簡化，這裡假設是全量更新或新增
    const updatedRules = [];
    for (const rule of newRules) {
      if (rule.id) {
        const updated = await RiskRule.update(rule.id, rule);
        updatedRules.push(updated);
      } else {
        const created = await RiskRule.create(rule);
        updatedRules.push(created);
      }
    }
    await this.loadRulesToCache(); // 更新快取
    return updatedRules;
  }

  /**
   * 獲取所有黑名單項目
   * @returns {Promise<Array<object>>} 黑名單項目陣列
   */
  async getBlacklist() {
    const cachedBlacklist = await this.redisClient.get(BLACKLIST_CACHE_KEY);
    if (cachedBlacklist) {
      return JSON.parse(cachedBlacklist);
    }
    const blacklist = await Blacklist.findAll();
    await this.redisClient.set(BLACKLIST_CACHE_KEY, JSON.stringify(blacklist));
    return blacklist;
  }

  /**
   * 新增黑名單項目
   * @param {object} item - 黑名單項目資料
   * @returns {Promise<object>} 新增的黑名單項目
   */
  async addBlacklistItem(item) {
    const newBlacklistItem = await Blacklist.create(item);
    await this.loadBlacklistToCache(); // 更新快取
    return newBlacklistItem;
  }

  /**
   * 移除黑名單項目
   * @param {number} id - 黑名單項目 ID
   * @returns {Promise<object|null>} 移除的黑名單項目或 null
   */
  async removeBlacklistItem(id) {
    const removedItem = await Blacklist.delete(id);
    await this.loadBlacklistToCache(); // 更新快取
    return removedItem;
  }

  /**
   * 獲取所有白名單項目
   * @returns {Promise<Array<object>>} 白名單項目陣列
   */
  async getWhitelist() {
    const cachedWhitelist = await this.redisClient.get(WHITELIST_CACHE_KEY);
    if (cachedWhitelist) {
      return JSON.parse(cachedWhitelist);
    }
    const whitelist = await Whitelist.findAll();
    await this.redisClient.set(WHITELIST_CACHE_KEY, JSON.stringify(whitelist));
    return whitelist;
  }

  /**
   * 新增白名單項目
   * @param {object} item - 白名單項目資料
   * @returns {Promise<object>} 新增的白名單項目
   */
  async addWhitelistItem(item) {
    const newWhitelistItem = await Whitelist.create(item);
    await this.loadWhitelistToCache(); // 更新快取
    return newWhitelistItem;
  }

  /**
   * 移除白名單項目
   * @param {number} id - 白名單項目 ID
   * @returns {Promise<object|null>} 移除的白名單項目或 null
   */
  async removeWhitelistItem(id) {
    const removedItem = await Whitelist.delete(id);
    await this.loadWhitelistToCache(); // 更新快取
    return removedItem;
  }

  /**
   * 檢查交易是否在黑名單中
   * @param {object} transactionData - 交易資料
   * @returns {Promise<boolean>} 如果在黑名單中則為 true，否則為 false
   */
  async checkBlacklist(transactionData) {
    const blacklist = await this.getBlacklist();
    // 這裡需要根據實際的黑名單規則來判斷
    // 假設黑名單可以包含 IP, user_id, device_id 等
    const { ip_address, user_id, device_id } = transactionData;

    return blacklist.some(item => {
      if (item.type === 'ip' && item.value === ip_address) return true;
      if (item.type === 'user_id' && item.value === String(user_id)) return true;
      if (item.type === 'device_id' && item.value === device_id) return true;
      return false;
    });
  }

  /**
   * 檢查交易是否在白名單中
   * @param {object} transactionData - 交易資料
   * @returns {Promise<boolean>} 如果在白名單中則為 true，否則為 false
   */
  async checkWhitelist(transactionData) {
    const whitelist = await this.getWhitelist();
    // 這裡需要根據實際的白名單規則來判斷
    const { user_id } = transactionData;

    return whitelist.some(item => {
      if (item.type === 'user_id' && item.value === String(user_id)) return true;
      return false;
    });
  }

  /**
   * 評估交易風險
   * @param {object} transactionData - 交易資料 (e.g., amount, currency, user_id, ip_address, device_id)
   * @returns {Promise<{riskScore: number, riskDecision: string, triggeredRules: Array<object>}>} 風險評估結果
   */
  async evaluateTransaction(transactionData) {
    let riskScore = 0;
    const triggeredRules = [];
    let riskDecision = "pass"; // 預設為通過

    // 1. 白名單檢查：如果在白名單中，直接通過
    const inWhitelist = await this.checkWhitelist(transactionData);
    if (inWhitelist) {
      return { riskScore: 0, riskDecision: "pass", triggeredRules: [] };
    }

    // 2. 黑名單檢查：如果在黑名單中，直接拒絕
    const inBlacklist = await this.checkBlacklist(transactionData);
    if (inBlacklist) {
      return { riskScore: 100, riskDecision: "reject", triggeredRules: [{ name: "Blacklist Hit", description: "交易方在黑名單中" }] };
    }

    // 3. 規則引擎評估
    const rules = await this.getRules();

    for (const rule of rules) {
      if (rule.status !== "active") continue;

      let ruleTriggered = false;
      // 根據 rule.condition_type 和 rule.condition_value 進行判斷
      // 這裡需要一個更複雜的規則解析器來處理不同的條件
      // 為了簡化，這裡只做一些基本示範
      switch (rule.condition_type) {
        case "min_amount":
          if (transactionData.amount < parseFloat(rule.condition_value)) {
            ruleTriggered = true;
          }
          break;
        case "max_amount":
          if (transactionData.amount > parseFloat(rule.condition_value)) {
            ruleTriggered = true;
          }
          break;
        case "ip_country":
          // 假設 transactionData 中有 ip_country 字段
          if (transactionData.ip_country === rule.condition_value) {
            ruleTriggered = true;
          }
          break;
        // 更多規則類型...
      }

      if (ruleTriggered) {
        riskScore += rule.score;
        triggeredRules.push(rule);
        if (rule.action === "reject") {
          riskDecision = "reject";
          break; // 如果有拒絕規則觸發，則立即停止評估
        } else if (rule.action === "review" && riskDecision !== "reject") {
          riskDecision = "review";
        }
      }
    }

    // 4. 異常行為檢測 (簡化示範)
    // 這裡可以加入更複雜的機器學習模型或統計分析來檢測異常
    if (transactionData.amount > 10000 && transactionData.user_id === "new_user") {
      riskScore += 20;
      triggeredRules.push({ name: "High Amount New User", description: "新用戶大額交易" });
      if (riskDecision === "pass") riskDecision = "review";
    }

    // 根據最終風險分數決定風險決策
    if (riskScore >= 80 && riskDecision !== "reject") {
      riskDecision = "reject";
    } else if (riskScore >= 40 && riskDecision === "pass") {
      riskDecision = "review";
    }

    return { riskScore, riskDecision, triggeredRules };
  }
}

module.exports = new RiskService();
