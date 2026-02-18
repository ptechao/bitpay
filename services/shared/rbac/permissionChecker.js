/**
 * @file services/shared/rbac/permissionChecker.js
 * @description 權限檢查中間件，檢查當前使用者是否有指定權限。
 * @author Manus AI
 * @date 2026-02-19
 */

const knex = require("../config/database");

/**
 * 檢查使用者是否擁有指定權限的 Express 中間件。
 * @param {string|Array<string>} requiredPermissions - 所需的單個權限字串或權限字串陣列。
 * @returns {function} - Express 中間件函數。
 */
function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    // 假設 req.user 已經由身份驗證中間件設置，包含 user.id 和 user.role
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : "guest"; // 預設角色

    if (!userId) {
      return res.status(401).json({ message: "未經授權：請登入。" });
    }

    // 將 requiredPermissions 轉換為陣列，方便處理
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    try {
      // 獲取使用者所有角色的權限
      const userPermissions = await knex("user_roles")
        .join("roles", "user_roles.role_id", "roles.id")
        .join("role_permissions", "roles.id", "role_permissions.role_id")
        .join("permissions", "role_permissions.permission_id", "permissions.id")
        .where("user_roles.user_id", userId)
        .distinct("permissions.name")
        .pluck("permissions.name");

      // 檢查使用者是否擁有所有必需的權限
      const hasAllPermissions = permissionsToCheck.every(perm => userPermissions.includes(perm));

      if (hasAllPermissions) {
        next();
      } else {
        return res.status(403).json({ message: "權限不足：您沒有執行此操作的權限。" });
      }
    } catch (error) {
      console.error("[PermissionChecker] 權限檢查時發生錯誤:", error);
      return res.status(500).json({ message: "伺服器內部錯誤，無法檢查權限。" });
    }
  };
}

module.exports = checkPermission;
