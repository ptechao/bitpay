/**
 * @file agent.js
 * @description 代理管理相關的 API 服務。
 * @author Manus AI
 * @date 2026-02-19
 */

import request from '../config/axios';

/**
 * 獲取代理列表
 * @param {object} params - 查詢參數
 * @returns {Promise<object>} - 代理列表數據
 */
export function getAgents(params) {
  return request({
    url: '/agents',
    method: 'get',
    params,
  });
}

/**
 * 獲取代理詳情
 * @param {string} agentId - 代理 ID
 * @returns {Promise<object>} - 代理詳情數據
 */
export function getAgentDetail(agentId) {
  return request({
    url: `/agents/${agentId}`,
    method: 'get',
  });
}

/**
 * 新增代理
 * @param {object} data - 代理數據
 * @returns {Promise<object>} - 新增代理的響應數據
 */
export function addAgent(data) {
  return request({
    url: '/agents',
    method: 'post',
    data,
  });
}

/**
 * 更新代理資訊
 * @param {string} agentId - 代理 ID
 * @param {object} data - 更新的代理數據
 * @returns {Promise<object>} - 更新代理的響應數據
 */
export function updateAgent(agentId, data) {
  return request({
    url: `/agents/${agentId}`,
    method: 'put',
    data,
  });
}

/**
 * 設定代理分潤規則
 * @param {string} agentId - 代理 ID
 * @param {object} data - 分潤規則數據
 * @returns {Promise<object>} - 設定響應數據
 */
export function setAgentCommissionRule(agentId, data) {
  return request({
    url: `/agents/${agentId}/commission-rule`,
    method: 'put',
    data,
  });
}

/**
 * 獲取代理層級樹
 * @returns {Promise<object>} - 代理層級樹數據
 */
export function getAgentHierarchyTree() {
  return request({
    url: '/agents/hierarchy-tree',
    method: 'get',
  });
}
