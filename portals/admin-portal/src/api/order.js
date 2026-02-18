/**
 * @file order.js
 * @description 訂單管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取支付訂單列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 支付訂單列表數據
 */
export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params,
  });
}

/**
 * 獲取訂單詳情
 * @param {string} orderId - 訂單 ID
 * @returns {Promise<object>} - 訂單詳情數據
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/orders/${orderId}`,
    method: 'get',
  });
}

/**
 * 申請退款
 * @param {string} orderId - 訂單 ID
 * @param {object} data - 退款數據
 * @returns {Promise<object>} - 退款響應數據
 */
export function applyRefund(orderId, data) {
  return request({
    url: `/orders/${orderId}/refund`,
    method: 'post',
    data,
  });
}

/**
 * 獲取退款列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 退款列表數據
 */
export function getRefunds(params) {
  return request({
    url: '/refunds',
    method: 'get',
    params,
  });
}

