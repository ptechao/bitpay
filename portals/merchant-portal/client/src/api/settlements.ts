/**
 * 聚合支付平台 - 商戶端前端應用
 * 結算 API 模組
 * 
 * 本模組封裝所有與結算相關的 API 呼叫，包括：
 * - 查詢結算單列表
 * - 查詢結算單詳情
 * - 申請提現
 * - 查詢提現記錄
 * 
 * 用途：提供統一的結算管理 API 介面
 */

import { apiClient, ApiResponse } from './client';

/**
 * 結算單狀態列舉
 */
export enum SettlementStatus {
  PENDING = 'pending',           // 待結算
  SETTLED = 'settled',           // 已結算
  PROCESSING = 'processing',     // 處理中
  COMPLETED = 'completed',       // 已完成
}

/**
 * 提現狀態列舉
 */
export enum WithdrawalStatus {
  PENDING = 'pending',           // 待審核
  APPROVED = 'approved',         // 已批准
  PROCESSING = 'processing',     // 處理中
  COMPLETED = 'completed',       // 已完成
  REJECTED = 'rejected',         // 已拒絕
  FAILED = 'failed',             // 已失敗
}

/**
 * 結算單資訊結構
 */
interface Settlement {
  id: string;
  settlement_no: string;
  merchant_id: string;
  period_start: string;
  period_end: string;
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  total_refunds: number;
  net_amount: number;
  currency: string;
  status: SettlementStatus;
  settled_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 結算單詳情（包含交易明細）
 */
interface SettlementDetail extends Settlement {
  transactions: Array<{
    order_id: string;
    amount: number;
    fee: number;
    status: string;
    created_at: string;
  }>;
}

/**
 * 結算列表查詢參數
 */
interface SettlementQueryParams {
  page?: number;
  page_size?: number;
  status?: SettlementStatus;
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at' | 'net_amount';
  sort_order?: 'asc' | 'desc';
}

/**
 * 結算列表回應
 */
interface SettlementListResponse {
  items: Settlement[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 提現資訊結構
 */
interface Withdrawal {
  id: string;
  withdrawal_no: string;
  merchant_id: string;
  settlement_id: string;
  amount: number;
  currency: string;
  bank_account?: string;
  crypto_wallet?: string;
  status: WithdrawalStatus;
  reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * 提現列表回應
 */
interface WithdrawalListResponse {
  items: Withdrawal[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 申請提現請求
 */
interface CreateWithdrawalRequest {
  settlement_id: string;
  amount: number;
  bank_account?: string;
  crypto_wallet?: string;
}

/**
 * 申請提現回應
 */
interface CreateWithdrawalResponse {
  withdrawal_id: string;
  withdrawal_no: string;
  status: WithdrawalStatus;
  created_at: string;
}

/**
 * 查詢結算單列表 API
 * 
 * @param {SettlementQueryParams} params - 查詢參數
 * @returns {Promise<ApiResponse<SettlementListResponse>>} 結算單列表
 * 
 * @example
 * const response = await settlementsApi.getSettlements({
 *   page: 1,
 *   page_size: 20,
 *   status: SettlementStatus.COMPLETED
 * });
 */
export async function getSettlements(
  params?: SettlementQueryParams
): Promise<ApiResponse<SettlementListResponse>> {
  const response = await apiClient.get<ApiResponse<SettlementListResponse>>(
    '/settlements',
    { params }
  );
  return response.data;
}

/**
 * 查詢結算單詳情 API
 * 
 * @param {string} settlementId - 結算單 ID
 * @returns {Promise<ApiResponse<SettlementDetail>>} 結算單詳情
 * 
 * @example
 * const response = await settlementsApi.getSettlementDetail('SETTLEMENT123');
 * console.log(response.data.net_amount);
 */
export async function getSettlementDetail(
  settlementId: string
): Promise<ApiResponse<SettlementDetail>> {
  const response = await apiClient.get<ApiResponse<SettlementDetail>>(
    `/settlements/${settlementId}`
  );
  return response.data;
}

/**
 * 查詢提現記錄列表 API
 * 
 * @param {number} page - 頁碼
 * @param {number} pageSize - 每頁筆數
 * @returns {Promise<ApiResponse<WithdrawalListResponse>>} 提現記錄列表
 * 
 * @example
 * const response = await settlementsApi.getWithdrawals(1, 20);
 */
export async function getWithdrawals(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<WithdrawalListResponse>> {
  const response = await apiClient.get<ApiResponse<WithdrawalListResponse>>(
    '/withdrawals',
    { params: { page, page_size: pageSize } }
  );
  return response.data;
}

/**
 * 查詢提現詳情 API
 * 
 * @param {string} withdrawalId - 提現 ID
 * @returns {Promise<ApiResponse<Withdrawal>>} 提現詳情
 * 
 * @example
 * const response = await settlementsApi.getWithdrawalDetail('WITHDRAWAL123');
 * console.log(response.data.status);
 */
export async function getWithdrawalDetail(
  withdrawalId: string
): Promise<ApiResponse<Withdrawal>> {
  const response = await apiClient.get<ApiResponse<Withdrawal>>(
    `/withdrawals/${withdrawalId}`
  );
  return response.data;
}

/**
 * 申請提現 API
 * 
 * @param {CreateWithdrawalRequest} data - 提現申請資料
 * @returns {Promise<ApiResponse<CreateWithdrawalResponse>>} 申請結果
 * 
 * @example
 * const response = await settlementsApi.createWithdrawal({
 *   settlement_id: 'SETTLEMENT123',
 *   amount: 1000.00,
 *   bank_account: 'ACCOUNT123'
 * });
 */
export async function createWithdrawal(
  data: CreateWithdrawalRequest
): Promise<ApiResponse<CreateWithdrawalResponse>> {
  const response = await apiClient.post<ApiResponse<CreateWithdrawalResponse>>(
    '/withdrawals',
    data
  );
  return response.data;
}

export type {
  Settlement,
  SettlementDetail,
  SettlementQueryParams,
  SettlementListResponse,
  Withdrawal,
  WithdrawalListResponse,
  CreateWithdrawalRequest,
  CreateWithdrawalResponse,
};
