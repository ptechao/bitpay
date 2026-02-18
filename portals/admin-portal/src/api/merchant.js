/**
 * @file merchant.js
 * @description 商戶管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取商戶列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 商戶列表數據
 */
export function getMerchants(params) {
  return request({
    url: '/merchants',
    method: 'get',
    params,
  });
}

/**
 * 獲取商戶詳情
 * @param {string} merchantId - 商戶 ID
 * @returns {Promise<object>} - 商戶詳情數據
 */
export function getMerchantDetail(merchantId) {
  return request({
    url: `/merchants/${merchantId}`,
    method: 'get',
  });
}

/**
 * 新增商戶
 * @param {object} data - 商戶數據
 * @returns {Promise<object>} - 新增商戶的響應數據
 */
export function addMerchant(data) {
  return request({
    url: '/merchants',
    method: 'post',
    data,
  });
}

/**
 * 更新商戶資訊
 * @param {string} merchantId - 商戶 ID
 * @param {object} data - 更新的商戶數據
 * @returns {Promise<object>} - 更新商戶的響應數據
 */
export function updateMerchant(merchantId, data) {
  return request({
    url: `/merchants/${merchantId}`,
    method: 'put',
    data,
  });
}

/**
 * 審核商戶
 * @param {string} merchantId - 商戶 ID
 * @param {object} data - 審核數據 (例如: status, reason)
 * @returns {Promise<object>} - 審核響應數據
 */
export function reviewMerchant(merchantId, data) {
  return request({
    url: `/merchants/${merchantId}/review`,
    method: 'post',
    data,
  });
}

/**
 * 啟用商戶
 * @param {string} merchantId - 商戶 ID
 * @returns {Promise<object>} - 啟用響應數據
 */
export function enableMerchant(merchantId) {
  return request({
    url: `/merchants/${merchantId}/enable`,
    method: 'post',
  });
}

/**
 * 停用商戶
 * @param {string} merchantId - 商戶 ID
 * @returns {Promise<object>} - 停用響應數據
 */
export function disableMerchant(merchantId) {
  return request({
    url: `/merchants/${merchantId}/disable`,
    method: 'post',
  });
}

/**
 * 設定商戶結算週期
 * @param {string} merchantId - 商戶 ID
 * @param {object} data - 結算週期數據 (例如: settlementPeriod)
 * @returns {Promise<object>} - 設定響應數據
 */
export function setMerchantSettlementPeriod(merchantId, data) {
  return request({
    url: `/merchants/${merchantId}/settlement-period`,
    method: 'put',
    data,
  });
}
