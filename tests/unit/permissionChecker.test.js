
/**
 * @file tests/unit/permissionChecker.test.js
 * @description 聚合支付平台權限檢查器的單元測試。
 *              測試用戶角色對資源操作的權限判斷邏輯。
 * @author Manus AI
 * @date 2026-02-19
 */

// 模擬一個簡單的權限檢查器
const permissionChecker = {
  // 定義角色及其擁有的權限
  roles: {
    admin: ["user:create", "user:read", "user:update", "user:delete", "order:read", "order:update", "report:read"],
    merchant: ["order:create", "order:read", "order:update", "report:read"],
    viewer: ["order:read", "report:read"],
  },

  /**
   * 檢查用戶是否具有執行特定操作的權限。
   * @param {string} role - 用戶的角色 (e.g., 'admin', 'merchant', 'viewer')。
   * @param {string} permission - 請求的權限 (e.g., 'user:create', 'order:read')。
   * @returns {boolean} 如果用戶具有權限則返回 true，否則返回 false。
   */
  can: (role, permission) => {
    if (!role || !permission) {
      return false;
    }
    const rolePermissions = permissionChecker.roles[role];
    if (!rolePermissions) {
      return false; // 角色不存在
    }
    return rolePermissions.includes(permission);
  },

  /**
   * 檢查用戶是否具有執行任何一個指定操作的權限。
   * @param {string} role - 用戶的角色。
   * @param {Array<string>} permissions - 請求的權限列表。
   * @returns {boolean} 如果用戶具有其中任何一個權限則返回 true，否則返回 false。
   */
  canAny: (role, permissions) => {
    if (!role || !Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }
    return permissions.some(p => permissionChecker.can(role, p));
  },

  /**
   * 檢查用戶是否具有執行所有指定操作的權限。
   * @param {string} role - 用戶的角色。
   * @param {Array<string>} permissions - 請求的權限列表。
   * @returns {boolean} 如果用戶具有所有權限則返回 true，否則返回 false。
   */
  canAll: (role, permissions) => {
    if (!role || !Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }
    return permissions.every(p => permissionChecker.can(role, p));
  },
};

describe("Permission Checker", () => {
  test("管理員應該擁有創建用戶的權限", () => {
    expect(permissionChecker.can("admin", "user:create")).toBe(true);
  });

  test("管理員應該擁有讀取訂單的權限", () => {
    expect(permissionChecker.can("admin", "order:read")).toBe(true);
  });

  test("商戶應該擁有創建訂單的權限", () => {
    expect(permissionChecker.can("merchant", "order:create")).toBe(true);
  });

  test("商戶不應該擁有刪除用戶的權限", () => {
    expect(permissionChecker.can("merchant", "user:delete")).toBe(false);
  });

  test("查看者應該擁有讀取報告的權限", () => {
    expect(permissionChecker.can("viewer", "report:read")).toBe(true);
  });

  test("查看者不應該擁有更新訂單的權限", () => {
    expect(permissionChecker.can("viewer", "order:update")).toBe(false);
  });

  test("不存在的角色不應該擁有任何權限", () => {
    expect(permissionChecker.can("nonexistent", "user:create")).toBe(false);
  });

  test("應該檢查用戶是否具有任何一個指定權限 (canAny)", () => {
    expect(permissionChecker.canAny("merchant", ["order:create", "user:delete"])).toBe(true);
    expect(permissionChecker.canAny("viewer", ["user:create", "user:delete"])).toBe(false);
    expect(permissionChecker.canAny("admin", ["user:create", "report:read"])).toBe(true);
  });

  test("應該檢查用戶是否具有所有指定權限 (canAll)", () => {
    expect(permissionChecker.canAll("admin", ["user:create", "order:read"])).toBe(true);
    expect(permissionChecker.canAll("merchant", ["order:create", "user:delete"])).toBe(false);
    expect(permissionChecker.canAll("viewer", ["order:read", "report:read"])).toBe(true);
  });

  test("處理無效的 canAny 輸入", () => {
    expect(permissionChecker.canAny("merchant", [])).toBe(false);
    expect(permissionChecker.canAny(null, ["order:create"])).toBe(false);
  });

  test("處理無效的 canAll 輸入", () => {
    expect(permissionChecker.canAll("merchant", [])).toBe(false);
    expect(permissionChecker.canAll(null, ["order:create"])).toBe(false);
  });
});
