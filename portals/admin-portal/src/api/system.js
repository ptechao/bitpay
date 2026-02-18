/**
 * @file system.js
 * @description 系統設定相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取管理員帳號列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 管理員帳號列表數據
 */
export function getAdminAccounts(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params,
  });
}

/**
 * 新增管理員帳號
 * @param {object} data - 管理員帳號數據
 * @returns {Promise<object>} - 新增管理員帳號的響應數據
 */
export function addAdminAccount(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data,
  });
}

/**
 * 更新管理員帳號資訊
 * @param {string} userId - 管理員 ID
 * @param {object} data - 更新的管理員帳號數據
 * @returns {Promise<object>} - 更新管理員帳號的響應數據
 */
export function updateAdminAccount(userId, data) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'put',
    data,
  });
}

/**
 * 刪除管理員帳號
 * @param {string} userId - 管理員 ID
 * @returns {Promise<object>} - 刪除管理員帳號的響應數據
 */
export function deleteAdminAccount(userId) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'delete',
  });
}

/**
 * 獲取角色列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 角色列表數據
 */
export function getRoles(params) {
  return request({
    url: '/admin/roles',
    method: 'get',
    params,
  });
}

/**
 * 新增角色
 * @param {object} data - 角色數據
 * @returns {Promise<object>} - 新增角色的響應數據
 */
export function addRole(data) {
  return request({
    url: '/admin/roles',
    method: 'post',
    data,
  });
}

/**
 * 更新角色資訊
 * @param {string} roleId - 角色 ID
 * @param {object} data - 更新的角色數據
 * @returns {Promise<object>} - 更新角色的響應數據
 */
export function updateRole(roleId, data) {
  return request({
    url: `/admin/roles/${roleId}`,
    method: 'put',
    data,
  });
}

/**
 * 刪除角色
 * @param {string} roleId - 角色 ID
 * @returns {Promise<object>} - 刪除角色的響應數據
 */
export function deleteRole(roleId) {
  return request({
    url: `/admin/roles/${roleId}`,
    method: 'delete',
  });
}

/**
 * 獲取系統參數
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 系統參數數據
 */
export function getSystemParams(params) {
  return request({
    url: '/admin/settings',
    method: 'get',
    params,
  });
}

/**
 * 更新系統參數
 * @param {object} data - 更新的系統參數數據
 * @returns {Promise<object>} - 更新系統參數的響應數據
 */
export function updateSystemParams(data) {
  return request({
    url: '/admin/settings',
    method: 'put',
    data,
  });
}
