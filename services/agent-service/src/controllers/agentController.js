// 檔案：src/controllers/agentController.js
// 說明：處理代理相關的業務邏輯，包括註冊、查詢、更新、下級管理和分潤配置。

const AgentModel = require("../models/agentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AgentController {
  /**
   * 代理註冊
   * POST /api/v1/agents/register
   */
  static async registerAgent(req, res, next) {
    try {
      const { username, password, email, name, contactPerson, phoneNumber, parentAgentId, commissionRateType, baseCommissionRate, markupRate } = req.body;

      // 檢查使用者名稱或電子郵件是否已存在
      if (await AgentModel.userExists(username, email)) {
        return res.status(400).json({ message: "使用者名稱或電子郵件已存在" });
      }

      // 雜湊密碼
      const passwordHash = await bcrypt.hash(password, 10);

      // 創建使用者
      const newUser = await AgentModel.createUser({
        username,
        passwordHash,
        email,
        phoneNumber,
        userType: "agent",
      });

      // 創建代理
      const newAgent = await AgentModel.createAgent({
        userId: newUser.id,
        name,
        contactPerson,
        contactEmail: email,
        phoneNumber,
        parentAgentId: parentAgentId || null, // 頂級代理沒有 parentAgentId
        commissionRateType: commissionRateType || "percentage",
        baseCommissionRate: baseCommissionRate || 0,
        markupRate: markupRate || 0,
      });

      // 建立代理層級關係
      await AgentService.updateAgentHierarchy(newAgent.id, parentAgentId);

      // 生成 JWT Token
      const token = jwt.sign(
        { userId: newUser.id, agentId: newAgent.id, userType: "agent" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(201).json({ message: "代理註冊成功", agent: newAgent, token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢代理資訊
   * GET /api/v1/agents/:agentId
   */
  static async getAgentInfo(req, res, next) {
    try {
      const { agentId } = req.params;
      const agent = await AgentModel.findAgentById(agentId);

      if (!agent) {
        return res.status(404).json({ message: "代理不存在" });
      }

      res.status(200).json({ agent });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新代理資訊
   * PUT /api/v1/agents/:agentId
   */
  static async updateAgentInfo(req, res, next) {
    try {
      const { agentId } = req.params;
      const updateData = req.body;

      const updatedAgent = await AgentModel.updateAgent(agentId, updateData);

      if (!updatedAgent) {
        return res.status(404).json({ message: "代理不存在或無更新" });
      }

      res.status(200).json({ message: "代理資訊更新成功", agent: updatedAgent });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 開通下級代理
   * POST /api/v1/agents/:agentId/sub-agents
   */
  static async createSubAgent(req, res, next) {
    try {
      const { agentId } = req.params; // 當前操作的代理ID
      const { username, password, email, name, contactPerson, phoneNumber, commissionRateType, baseCommissionRate, markupRate } = req.body;

      // 檢查當前代理是否存在
      if (!(await AgentModel.agentExists(agentId))) {
        return res.status(404).json({ message: "上級代理不存在" });
      }

      // 檢查使用者名稱或電子郵件是否已存在
      if (await AgentModel.userExists(username, email)) {
        return res.status(400).json({ message: "使用者名稱或電子郵件已存在" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await AgentModel.createUser({
        username,
        passwordHash,
        email,
        phoneNumber,
        userType: "agent",
      });

      const newSubAgent = await AgentModel.createAgent({
        userId: newUser.id,
        name,
        contactPerson,
        contactEmail: email,
        phoneNumber,
        parentAgentId: parseInt(agentId), // 設定上級代理為當前操作的代理
        commissionRateType: commissionRateType || "percentage",
        baseCommissionRate: baseCommissionRate || 0,
        markupRate: markupRate || 0,
      });

      // 建立代理層級關係
      await AgentService.updateAgentHierarchy(newSubAgent.id, parseInt(agentId));

      res.status(201).json({ message: "下級代理開通成功", subAgent: newSubAgent });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 開通商戶
   * POST /api/v1/agents/:agentId/merchants
   */
  static async createMerchant(req, res, next) {
    try {
      const { agentId } = req.params; // 當前操作的代理ID
      const { username, password, email, name, legalName, contactPerson, phoneNumber, address, website } = req.body;

      // 檢查當前代理是否存在
      if (!(await AgentModel.agentExists(agentId))) {
        return res.status(404).json({ message: "所屬代理不存在" });
      }

      // 檢查使用者名稱或電子郵件是否已存在
      if (await AgentModel.userExists(username, email)) {
        return res.status(400).json({ message: "使用者名稱或電子郵件已存在" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await AgentModel.createUser({
        username,
        passwordHash,
        email,
        phoneNumber,
        userType: "merchant",
      });

      const newMerchant = await AgentModel.createMerchant({
        userId: newUser.id,
        name,
        legalName,
        contactPerson,
        contactEmail: email,
        phoneNumber,
        address,
        website,
        parentAgentId: parseInt(agentId), // 設定所屬代理為當前操作的代理
      });

      res.status(201).json({ message: "商戶開通成功", merchant: newMerchant });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢下級代理和商戶列表
   * GET /api/v1/agents/:agentId/subordinates
   */
  static async getSubordinates(req, res, next) {
    try {
      const { agentId } = req.params;

      if (!(await AgentModel.agentExists(agentId))) {
        return res.status(404).json({ message: "代理不存在" });
      }

      const subordinates = await AgentModel.getSubordinates(agentId);
      res.status(200).json(subordinates);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查詢分潤記錄
   * GET /api/v1/agents/:agentId/commissions
   */
  static async getCommissions(req, res, next) {
    try {
      const { agentId } = req.params;
      const filters = req.query; // 獲取查詢參數作為過濾條件

      if (!(await AgentModel.agentExists(agentId))) {
        return res.status(404).json({ message: "代理不存在" });
      }

      const commissions = await AgentModel.getAgentCommissionRecords(agentId, filters);
      res.status(200).json({ commissions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 設定分潤規則
   * PUT /api/v1/agents/:agentId/commission-config
   */
  static async setCommissionConfig(req, res, next) {
    try {
      const { agentId } = req.params;
      const { commissionRateType, baseCommissionRate, markupRate } = req.body;

      if (!(await AgentModel.agentExists(agentId))) {
        return res.status(404).json({ message: "代理不存在" });
      }

      const updatedAgent = await AgentModel.updateAgent(agentId, {
        commissionRateType,
        baseCommissionRate,
        markupRate,
      });

      res.status(200).json({ message: "分潤規則設定成功", agent: updatedAgent });
    } catch (error) {
      next(error);
    }
  }


}

module.exports = AgentController;
