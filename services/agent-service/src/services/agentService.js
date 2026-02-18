// 檔案：src/services/agentService.js
// 說明：處理代理服務的業務邏輯，包括代理層級關係管理、分潤規則設定等。

const AgentModel = require("../models/agentModel");

class AgentService {
  /**
   * 建立或更新代理層級關係
   * 當一個新代理被創建或其上級代理發生變化時調用。
   * @param {number} agentId - 代理 ID
   * @param {number|null} parentAgentId - 上級代理 ID，如果沒有則為 null
   */
  static async updateAgentHierarchy(agentId, parentAgentId) {
    // 確保代理自身存在於層級表中 (depth = 0)
    await AgentModel.createAgentHierarchy(agentId, agentId, 0);

    if (parentAgentId) {
      // 獲取上級代理的所有祖先 (包括上級代理自身)
      const parentAncestors = await AgentModel.getAgentAncestors(parentAgentId);

      // 為新代理建立與其所有祖先的層級關係
      for (const ancestor of parentAncestors) {
        await AgentModel.createAgentHierarchy(ancestor.ancestor_id, agentId, ancestor.depth + 1);
      }
      // 建立直接上級與新代理的層級關係
      await AgentModel.createAgentHierarchy(parentAgentId, agentId, 1);
    }
  }

  /**
   * 獲取代理的分潤規則
   * @param {number} agentId - 代理 ID
   * @returns {Promise<object|null>} 分潤規則物件或 null
   */
  static async getCommissionConfig(agentId) {
    const agent = await AgentModel.findAgentById(agentId);
    if (agent) {
      return {
        commissionRateType: agent.commission_rate_type,
        baseCommissionRate: agent.base_commission_rate,
        markupRate: agent.markup_rate,
      };
    }
    return null;
  }

  /**
   * 設定代理的分潤規則
   * @param {number} agentId - 代理 ID
   * @param {string} commissionRateType - 分潤模式 (percentage, fixed, markup)
   * @param {number} baseCommissionRate - 基礎分潤比例或固定金額
   * @param {number} markupRate - Mark-up 比例
   * @returns {Promise<object|null>} 更新後的代理資訊或 null
   */
  static async setCommissionConfig(agentId, commissionRateType, baseCommissionRate, markupRate) {
    const updateData = {
      commission_rate_type: commissionRateType,
      base_commission_rate: baseCommissionRate,
      markup_rate: markupRate,
    };
    return AgentModel.updateAgent(agentId, updateData);
  }

  /**
   * 獲取代理的所有下級代理和商戶
   * @param {number} agentId - 代理 ID
   * @returns {Promise<object>} 包含下級代理和商戶的物件
   */
  static async getSubordinates(agentId) {
    return AgentModel.getSubordinates(agentId);
  }

  /**
   * 獲取代理的分潤記錄
   * @param {number} agentId - 代理 ID
   * @param {object} filters - 過濾條件
   * @returns {Promise<Array<object>>} 分潤記錄列表
   */
  static async getAgentCommissionRecords(agentId, filters) {
    return AgentModel.getAgentCommissionRecords(agentId, filters);
  }
}

module.exports = AgentService;
