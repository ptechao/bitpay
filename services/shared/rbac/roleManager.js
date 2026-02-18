/**
 * @file services/shared/rbac/roleManager.js
 * @description 角色管理模組，用於建立自定義角色、指定權限組合。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class RoleManager {
  /**
   * 創建新角色
   * @param {string} name - 角色名稱
   * @param {string} description - 角色描述
   * @param {Array<string>} permissionNames - 權限名稱陣列 (e.g., ["order.view", "order.create"])
   * @returns {Promise<object>} - 創建的角色物件
   */
  static async createRole(name, description, permissionNames = []) {
    return knex.transaction(async trx => {
      const [role] = await trx("roles").insert({ name, description }).returning("*");

      if (permissionNames.length > 0) {
        const permissions = await trx("permissions").whereIn("name", permissionNames).select("id");
        if (permissions.length !== permissionNames.length) {
          throw new Error("部分權限名稱無效。");
        }
        const rolePermissions = permissions.map(p => ({
          role_id: role.id,
          permission_id: p.id,
        }));
        await trx("role_permissions").insert(rolePermissions);
      }
      return role;
    });
  }

  /**
   * 更新角色資訊和權限
   * @param {string} roleId - 角色 ID
   * @param {string} name - 角色名稱
   * @param {string} description - 角色描述
   * @param {Array<string>} permissionNames - 權限名稱陣列
   * @returns {Promise<object>} - 更新後的角色物件
   */
  static async updateRole(roleId, name, description, permissionNames = []) {
    return knex.transaction(async trx => {
      const [updatedRole] = await trx("roles")
        .where({ id: roleId })
        .update({ name, description, updated_at: knex.fn.now() })
        .returning("*");

      if (!updatedRole) {
        throw new Error("角色不存在。");
      }

      // 先刪除舊權限，再插入新權限
      await trx("role_permissions").where({ role_id: roleId }).del();

      if (permissionNames.length > 0) {
        const permissions = await trx("permissions").whereIn("name", permissionNames).select("id");
        if (permissions.length !== permissionNames.length) {
          throw new Error("部分權限名稱無效。");
        }
        const rolePermissions = permissions.map(p => ({
          role_id: roleId,
          permission_id: p.id,
        }));
        await trx("role_permissions").insert(rolePermissions);
      }
      return updatedRole;
    });
  }

  /**
   * 刪除角色
   * @param {string} roleId - 角色 ID
   */
  static async deleteRole(roleId) {
    return knex.transaction(async trx => {
      // 刪除角色前，需要確保沒有使用者關聯到此角色
      const userCount = await trx("user_roles").where({ role_id: roleId }).count("*").first();
      if (parseInt(userCount.count, 10) > 0) {
        throw new Error("無法刪除：有使用者仍關聯到此角色。");
      }
      await trx("roles").where({ id: roleId }).del();
    });
  }

  /**
   * 獲取所有角色
   * @returns {Promise<Array<object>>} - 角色陣列
   */
  static async getAllRoles() {
    return knex("roles").select("*");
  }

  /**
   * 獲取指定角色的權限
   * @param {string} roleId - 角色 ID
   * @returns {Promise<Array<string>>} - 權限名稱陣列
   */
  static async getRolePermissions(roleId) {
    const permissions = await knex("role_permissions")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("role_permissions.role_id", roleId)
      .select("permissions.name");
    return permissions.map(p => p.name);
  }

  /**
   * 為使用者指派角色
   * @param {string} userId - 使用者 ID
   * @param {Array<string>} roleIds - 角色 ID 陣列
   */
  static async assignUserRoles(userId, roleIds = []) {
    return knex.transaction(async trx => {
      // 先刪除使用者所有舊角色，再插入新角色
      await trx("user_roles").where({ user_id: userId }).del();

      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          user_id: userId,
          role_id: roleId,
        }));
        await trx("user_roles").insert(userRoles);
      }
    });
  }

  /**
   * 獲取指定使用者的所有角色
   * @param {string} userId - 使用者 ID
   * @returns {Promise<Array<object>>} - 角色物件陣列
   */
  static async getUserRoles(userId) {
    return knex("user_roles")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", userId)
      .select("roles.id", "roles.name", "roles.description");
  }

  /**
   * 初始化預設權限 (如果不存在)
   */
  static async initializePermissions() {
    const definedPermissions = require("./permissionDefinitions");
    const existingPermissions = await knex("permissions").select("name");
    const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

    const permissionsToInsert = [];
    for (const name in definedPermissions) {
      if (!existingPermissionNames.has(name)) {
        permissionsToInsert.push({
          name: name,
          description: definedPermissions[name],
        });
      }
    }

    if (permissionsToInsert.length > 0) {
      await knex("permissions").insert(permissionsToInsert);
      console.log(`[RoleManager] 已初始化 ${permissionsToInsert.length} 個新權限。`);
    } else {
      console.log("[RoleManager] 無新權限需要初始化。");
    }
  }
}

module.exports = RoleManager;
