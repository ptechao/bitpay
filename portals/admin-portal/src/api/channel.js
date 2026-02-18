/**
 * @file channel.js
 * @description 通道管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取通道列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 通道列表數據
 */
export function getChannels(params) {
  return request({
    url: '/channels',
    method: 'get',
    params,
  });
}

/**
 * 獲取通道詳情
 * @param {string} channelId - 通道 ID
 * @returns {Promise<object>} - 通道詳情數據
 */
export function getChannelDetail(channelId) {
  return request({
    url: `/channels/${channelId}`,
    method: 'get',
  });
}

/**
 * 新增通道
 * @param {object} data - 通道數據
 * @returns {Promise<object>} - 新增通道的響應數據
 */
export function addChannel(data) {
  return request({
    url: '/channels',
    method: 'post',
    data,
  });
}

/**
 * 更新通道資訊
 * @param {string} channelId - 通道 ID
 * @param {object} data - 更新的通道數據
 * @returns {Promise<object>} - 更新通道的響應數據
 */
export function updateChannel(channelId, data) {
  return request({
    url: `/channels/${channelId}`,
    method: 'put',
    data,
  });
}

/**
 * 配置通道幣種
 * @param {string} channelId - 通道 ID
 * @param {object} data - 幣種配置數據
 * @returns {Promise<object>} - 配置響應數據
 */
export function configChannelCurrency(channelId, data) {
  return request({
    url: `/channels/${channelId}/currency-config`,
    method: 'put',
    data,
  });
}

/**
 * 獲取通道狀態監控數據
 * @returns {Promise<object>} - 通道狀態監控數據
 */
export function getChannelMonitorStatus() {
  return request({
    url: '/channels/monitor',
    method: 'get',
  });
}
