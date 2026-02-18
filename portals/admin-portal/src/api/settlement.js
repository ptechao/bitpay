/**
 * @file settlement.js
 * @description 結算管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取結算單列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 結算單列表數據
 */
export function getSettlements(params) {
  return request({
    url: '/settlements',
    method: 'get',
    params,
  });
}

/**
 * 手動觸發結算
 * @param {object} data - 結算觸發數據
 * @returns {Promise<object>} - 結算觸發響應數據
 */
export function triggerManualSettlement(data) {
  return request({
    url: '/settlements/manual-trigger',
    method: 'post',
    data,
  });
}

/**
 * 獲取提現審核列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 提現審核列表數據
 */
export function getWithdrawalReviews(params) {
  return request({
    url: '/withdrawals/reviews',
    method: 'get',
    params,
  });
}

/**
 * 審核提現請求
 * @param {string} withdrawalId - 提現 ID
 * @param {object} data - 審核數據 (例如: status, reason)
 * @returns {Promise<object>} - 審核響應數據
 */
export function reviewWithdrawal(withdrawalId, data) {
  return request({
    url: `/withdrawals/${withdrawalId}/review`,
    method: 'post',
    data,
  });
}
