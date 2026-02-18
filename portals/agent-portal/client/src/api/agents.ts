/**
 * 前言：本檔案提供代理管理相關的 API 呼叫
 * 用途：代理列表、開通、編輯、啟用/停用等操作
 * 維護者：開發團隊
 */

import axiosInstance from './client';
import { Agent, AgentCreateRequest, AgentUpdateRequest, ApiResponse, PaginatedResponse } from '../types';

/**
 * 獲取下級代理列表
 */
export const getSubordinateAgents = (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Agent>>> => {
  return axiosInstance.get('/agents/subordinates', {
    params: { page, page_size: pageSize },
  });
};

/**
 * 獲取代理詳情
 */
export const getAgentDetail = (agentId: number): Promise<ApiResponse<Agent>> => {
  return axiosInstance.get(`/agents/${agentId}`);
};

/**
 * 開通下級代理
 */
export const createSubordinateAgent = (
  data: AgentCreateRequest
): Promise<ApiResponse<Agent>> => {
  return axiosInstance.post('/agents/subordinates', data);
};

/**
 * 編輯下級代理
 */
export const updateSubordinateAgent = (
  agentId: number,
  data: AgentUpdateRequest
): Promise<ApiResponse<Agent>> => {
  return axiosInstance.put(`/agents/${agentId}`, data);
};

/**
 * 啟用/停用代理
 */
export const toggleAgentStatus = (
  agentId: number,
  status: 'active' | 'suspended'
): Promise<ApiResponse<Agent>> => {
  return axiosInstance.patch(`/agents/${agentId}/status`, { status });
};

/**
 * 獲取代理統計資訊
 */
export const getAgentStats = (agentId?: number): Promise<ApiResponse<any>> => {
  return axiosInstance.get('/agents/stats', {
    params: agentId ? { agent_id: agentId } : {},
  });
};
