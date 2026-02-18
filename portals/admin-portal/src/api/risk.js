/**
 * @file risk.js
 * @description 風控管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取風控規則列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 風控規則列表數據
 */
export function getRiskRules(params) {
  return request({
    url: '/risk/rules',
    method: 'get',
    params,
  });
}

/**
 * 新增風控規則
 * @param {object} data - 風控規則數據
 * @returns {Promise<object>} - 新增風控規則的響應數據
 */
export function addRiskRule(data) {
  return request({
    url: '/risk/rules',
    method: 'post',
    data,
  });
}

/**
 * 更新風控規則
 * @param {string} ruleId - 風控規則 ID
 * @param {object} data - 更新的風控規則數據
 * @returns {Promise<object>} - 更新風控規則的響應數據
 */
export function updateRiskRule(ruleId, data) {
  return request({
    url: `/risk/rules/${ruleId}`,
    method: 'put',
    data,
  });
}

/**
 * 刪除風控規則
 * @param {string} ruleId - 風控規則 ID
 * @returns {Promise<object>} - 刪除風控規則的響應數據
 */
export function deleteRiskRule(ruleId) {
  return request({
    url: `/risk/rules/${ruleId}`,
    method: 'delete',
  });
}

/**
 * 獲取黑白名單列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 黑白名單列表數據
 */
export function getBlackWhitelist(params) {
  return request({
    url: '/risk/blacklist-whitelist',
    method: 'get',
    params,
  });
}

/**
 * 新增黑白名單項目
 * @param {object} data - 黑白名單項目數據
 * @returns {Promise<object>} - 新增黑白名單項目的響應數據
 */
export function addBlackWhitelistItem(data) {
  return request({
    url: '/risk/blacklist-whitelist',
    method: 'post',
    data,
  });
}

/**
 * 刪除黑白名單項目
 * @param {string} itemId - 黑白名單項目 ID
 * @returns {Promise<object>} - 刪除黑白名單項目的響應數據
 */
export function deleteBlackWhitelistItem(itemId) {
  return request({
    url: `/risk/blacklist-whitelist/${itemId}`,
    method: 'delete',
  });
}
