/**
 * @file services/shared/rbac/permissionDefinitions.js
 * @description 定義所有權限項目。
 * @author Manus AI
 * @date 2026-02-19
 */

const permissions = {
  // 訂單管理
  "order.view": "查看訂單",
  "order.create": "創建訂單",
  "order.update": "更新訂單",
  "order.cancel": "取消訂單",
  "order.refund": "訂單退款",

  // 結算管理
  "settlement.view": "查看結算單",
  "settlement.create": "創建結算單",
  "settlement.approve": "審批結算單",
  "settlement.withdraw": "結算提現",

  // 商戶管理
  "merchant.view": "查看商戶",
  "merchant.create": "創建商戶",
  "merchant.update": "更新商戶",
  "merchant.status.toggle": "啟用/禁用商戶",
  "merchant.config.manage": "管理商戶配置",

  // 代理管理
  "agent.view": "查看代理",
  "agent.create": "創建代理",
  "agent.update": "更新代理",
  "agent.status.toggle": "啟用/禁用代理",
  "agent.commission.config": "管理代理分潤配置",

  // 通道管理
  "channel.view": "查看支付通道",
  "channel.manage": "管理支付通道 (增刪改)",

  // 風控管理
  "risk.view": "查看風控規則",
  "risk.manage": "管理風控規則 (增刪改)",
  "risk.log.view": "查看風控日誌",

  // 系統設定
  "system.settings.view": "查看系統設定",
  "system.settings.manage": "管理系統設定",

  // RBAC 管理
  "rbac.role.view": "查看角色",
  "rbac.role.manage": "管理角色 (增刪改)",
  "rbac.permission.view": "查看權限",
  "rbac.user.role.assign": "指派使用者角色",

  // 操作日誌
  "audit.log.view": "查看操作日誌",
  "audit.log.export": "匯出操作日誌",
};

module.exports = permissions;
