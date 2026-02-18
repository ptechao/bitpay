/**
 * @file services/shared/controllers/rbacController.js
 * @description RBAC 相關 API 的控制器。
 * @author Manus AI
 * @date 2026-02-19
 */

const RoleManager = require("../rbac/roleManager");
const permissions = require("../rbac/permissionDefinitions");
const knex = require("../config/database");

class RbacController {
  /**
   * 獲取所有權限定義
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async getPermissionDefinitions(req, res) {
    try {
      return res.status(200).json(permissions);
    } catch (error) {
      console.error("[RbacController] 獲取權限定義失敗:", error);
      return res.status(500).json({ message: "獲取權限定義失敗。" });
    }
  }

  /**
   * 創建新角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async createRole(req, res) {
    const { name, description, permissionNames } = req.body;
    if (!name) {
      return res.status(400).json({ message: "角色名稱為必填項。" });
    }
    try {
      const role = await RoleManager.createRole(name, description, permissionNames);
      return res.status(201).json({ message: "角色創建成功。", role });
    } catch (error) {
      console.error("[RbacController] 創建角色失敗:", error);
      return res.status(500).json({ message: error.message || "創建角色失敗。" });
    }
  }

  /**
   * 更新角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async updateRole(req, res) {
    const { id } = req.params;
    const { name, description, permissionNames } = req.body;
    if (!name) {
      return res.status(400).json({ message: "角色名稱為必填項。" });
    }
    try {
      const role = await RoleManager.updateRole(id, name, description, permissionNames);
      return res.status(200).json({ message: "角色更新成功。", role });
    } catch (error) {
      console.error("[RbacController] 更新角色失敗:", error);
      return res.status(500).json({ message: error.message || "更新角色失敗。" });
    }
  }

  /**
   * 刪除角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async deleteRole(req, res) {
    const { id } = req.params;
    try {
      await RoleManager.deleteRole(id);
      return res.status(200).json({ message: "角色刪除成功。" });
    } catch (error) {
      console.error("[RbacController] 刪除角色失敗:", error);
      return res.status(500).json({ message: error.message || "刪除角色失敗。" });
    }
  }

  /**
   * 獲取所有角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async getAllRoles(req, res) {
    try {
      const roles = await RoleManager.getAllRoles();
      return res.status(200).json(roles);
    } catch (error) {
      console.error("[RbacController] 獲取所有角色失敗:", error);
      return res.status(500).json({ message: "獲取所有角色失敗。" });
    }
  }

  /**
   * 獲取指定角色的權限
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async getRolePermissions(req, res) {
    const { id } = req.params;
    try {
      const rolePermissions = await RoleManager.getRolePermissions(id);
      return res.status(200).json(rolePermissions);
    } catch (error) {
      console.error("[RbacController] 獲取角色權限失敗:", error);
      return res.status(500).json({ message: "獲取角色權限失敗。" });
    }
  }

  /**
   * 為使用者指派角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async assignUserRoles(req, res) {
    const { userId } = req.params;
    const { roleIds } = req.body;
    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ message: "roleIds 必須是一個陣列。" });
    }
    try {
      await RoleManager.assignUserRoles(userId, roleIds);
      return res.status(200).json({ message: "使用者角色指派成功。" });
    } catch (error) {
      console.error("[RbacController] 指派使用者角色失敗:", error);
      return res.status(500).json({ message: error.message || "指派使用者角色失敗。" });
    }
  }

  /**
   * 獲取指定使用者的所有角色
   * @param {object} req - Express 請求物件
   * @param {object} res - Express 回應物件
   */
  static async getUserRoles(req, res) {
    const { userId } = req.params;
    try {
      const roles = await RoleManager.getUserRoles(userId);
      return res.status(200).json(roles);
    } catch (error) {
      console.error("[RbacController] 獲取使用者角色失敗:", error);
      return res.status(500).json({ message: "獲取使用者角色失敗。" });
    }
  }
}

module.exports = RbacController;
