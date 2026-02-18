/**
 * @file login.js
 * @description 登入相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 管理員登入
 * @param {object} data - 登入請求數據
 * @param {string} data.username - 使用者名稱
 * @param {string} data.password - 密碼
 * @returns {Promise<object>} - 包含 token 的響應數據
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  });
}

/**
 * 登出
 * @returns {Promise<object>} - 登出響應數據
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  });
}
