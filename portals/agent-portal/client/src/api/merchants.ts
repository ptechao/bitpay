/**
 * 前言：本檔案提供商戶管理相關的 API 呼叫
 * 用途：商戶列表、開通、編輯、結算週期設定等操作
 * 維護者：開發團隊
 */

import axiosInstance from './client';
import { Merchant, MerchantCreateRequest, MerchantUpdateRequest, ApiResponse, PaginatedResponse } from '../types';

/**
 * 獲取商戶列表
 */
export const getMerchants = (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Merchant>>> => {
  return axiosInstance.get('/merchants', {
    params: { page, page_size: pageSize },
  });
};

/**
 * 獲取商戶詳情
 */
export const getMerchantDetail = (merchantId: number): Promise<ApiResponse<Merchant>> => {
  return axiosInstance.get(`/merchants/${merchantId}`);
};

/**
 * 開通商戶
 */
export const createMerchant = (
  data: MerchantCreateRequest
): Promise<ApiResponse<Merchant>> => {
  return axiosInstance.post('/merchants', data);
};

/**
 * 編輯商戶
 */
export const updateMerchant = (
  merchantId: number,
  data: MerchantUpdateRequest
): Promise<ApiResponse<Merchant>> => {
  return axiosInstance.put(`/merchants/${merchantId}`, data);
};

/**
 * 設定商戶結算週期
 */
export const setMerchantSettlementPeriod = (
  merchantId: number,
  settlementPeriod: string
): Promise<ApiResponse<Merchant>> => {
  return axiosInstance.patch(`/merchants/${merchantId}/settlement-period`, {
    settlement_period: settlementPeriod,
  });
};

/**
 * 啟用/停用商戶
 */
export const toggleMerchantStatus = (
  merchantId: number,
  status: 'active' | 'suspended'
): Promise<ApiResponse<Merchant>> => {
  return axiosInstance.patch(`/merchants/${merchantId}/status`, { status });
};
