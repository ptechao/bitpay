/**
 * 聚合支付平台 - 商戶端前端應用
 * 商戶資訊 API 模組
 * 
 * 本模組封裝所有與商戶資訊相關的 API 呼叫，包括：
 * - 查詢商戶基本資訊
 * - 更新商戶資訊
 * - 查詢商戶統計資訊
 * - 管理結算帳戶
 * 
 * 用途：提供統一的商戶資訊管理 API 介面
 */

import { apiClient, ApiResponse } from './client';

/**
 * 商戶基本資訊結構
 */
interface MerchantInfo {
  id: string;
  user_id: string;
  name: string;
  legal_name?: string;
  contact_person?: string;
  contact_email: string;
  phone_number?: string;
  address?: string;
  website?: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

/**
 * 商戶統計資訊結構
 */
interface MerchantStatistics {
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  total_refunds: number;
  success_rate: number;
  pending_amount: number;
  settled_amount: number;
  last_30_days_transactions: number;
  last_30_days_amount: number;
}

/**
 * 結算帳戶結構
 */
interface SettlementAccount {
  id: string;
  merchant_id: string;
  account_type: 'bank' | 'crypto';
  account_holder: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  crypto_wallet?: string;
  crypto_type?: string; // BTC, ETH, USDT 等
  status: 'active' | 'inactive' | 'verified' | 'unverified';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 儀表板統計資訊
 */
interface DashboardStats {
  today_transactions: number;
  today_amount: number;
  today_success_rate: number;
  pending_settlements: number;
  pending_refunds: number;
  recent_transactions: Array<{
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  transaction_trend: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

/**
 * 查詢商戶基本資訊 API
 * 
 * @returns {Promise<ApiResponse<MerchantInfo>>} 商戶基本資訊
 * 
 * @example
 * const response = await merchantApi.getMerchantInfo();
 * console.log(response.data.name);
 */
export async function getMerchantInfo(): Promise<ApiResponse<MerchantInfo>> {
  const response = await apiClient.get<ApiResponse<MerchantInfo>>(
    '/merchants/info'
  );
  return response.data;
}

/**
 * 更新商戶基本資訊 API
 * 
 * @param {Partial<MerchantInfo>} data - 要更新的商戶資訊
 * @returns {Promise<ApiResponse<MerchantInfo>>} 更新後的商戶資訊
 * 
 * @example
 * const response = await merchantApi.updateMerchantInfo({
 *   contact_person: 'John Doe',
 *   phone_number: '1234567890'
 * });
 */
export async function updateMerchantInfo(
  data: Partial<MerchantInfo>
): Promise<ApiResponse<MerchantInfo>> {
  const response = await apiClient.put<ApiResponse<MerchantInfo>>(
    '/merchants/info',
    data
  );
  return response.data;
}

/**
 * 查詢商戶統計資訊 API
 * 
 * @returns {Promise<ApiResponse<MerchantStatistics>>} 商戶統計資訊
 * 
 * @example
 * const response = await merchantApi.getMerchantStatistics();
 * console.log(response.data.success_rate);
 */
export async function getMerchantStatistics(): Promise<
  ApiResponse<MerchantStatistics>
> {
  const response = await apiClient.get<ApiResponse<MerchantStatistics>>(
    '/merchants/statistics'
  );
  return response.data;
}

/**
 * 查詢儀表板統計資訊 API
 * 用於首頁儀表板展示
 * 
 * @returns {Promise<ApiResponse<DashboardStats>>} 儀表板統計資訊
 * 
 * @example
 * const response = await merchantApi.getDashboardStats();
 * console.log(response.data.today_amount);
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    '/merchants/dashboard-stats'
  );
  return response.data;
}

/**
 * 查詢結算帳戶列表 API
 * 
 * @returns {Promise<ApiResponse<SettlementAccount[]>>} 結算帳戶列表
 * 
 * @example
 * const response = await merchantApi.getSettlementAccounts();
 */
export async function getSettlementAccounts(): Promise<
  ApiResponse<SettlementAccount[]>
> {
  const response = await apiClient.get<ApiResponse<SettlementAccount[]>>(
    '/merchants/settlement-accounts'
  );
  return response.data;
}

/**
 * 新增結算帳戶 API
 * 
 * @param {Partial<SettlementAccount>} data - 結算帳戶資訊
 * @returns {Promise<ApiResponse<SettlementAccount>>} 新增的結算帳戶
 * 
 * @example
 * const response = await merchantApi.addSettlementAccount({
 *   account_type: 'bank',
 *   account_holder: 'Company Name',
 *   account_number: '1234567890',
 *   bank_name: 'Bank of America'
 * });
 */
export async function addSettlementAccount(
  data: Partial<SettlementAccount>
): Promise<ApiResponse<SettlementAccount>> {
  const response = await apiClient.post<ApiResponse<SettlementAccount>>(
    '/merchants/settlement-accounts',
    data
  );
  return response.data;
}

/**
 * 更新結算帳戶 API
 * 
 * @param {string} accountId - 結算帳戶 ID
 * @param {Partial<SettlementAccount>} data - 要更新的結算帳戶資訊
 * @returns {Promise<ApiResponse<SettlementAccount>>} 更新後的結算帳戶
 * 
 * @example
 * const response = await merchantApi.updateSettlementAccount('ACCOUNT123', {
 *   is_default: true
 * });
 */
export async function updateSettlementAccount(
  accountId: string,
  data: Partial<SettlementAccount>
): Promise<ApiResponse<SettlementAccount>> {
  const response = await apiClient.put<ApiResponse<SettlementAccount>>(
    `/merchants/settlement-accounts/${accountId}`,
    data
  );
  return response.data;
}

/**
 * 刪除結算帳戶 API
 * 
 * @param {string} accountId - 結算帳戶 ID
 * @returns {Promise<ApiResponse>} 刪除結果
 * 
 * @example
 * await merchantApi.deleteSettlementAccount('ACCOUNT123');
 */
export async function deleteSettlementAccount(accountId: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(
    `/merchants/settlement-accounts/${accountId}`
  );
  return response.data;
}

export type {
  MerchantInfo,
  MerchantStatistics,
  SettlementAccount,
  DashboardStats,
};
