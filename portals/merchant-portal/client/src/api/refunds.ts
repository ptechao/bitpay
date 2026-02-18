/**
 * 聚合支付平台 - 商戶端前端應用
 * 退款 API 模組
 * 
 * 本模組封裝所有與退款相關的 API 呼叫，包括：
 * - 申請退款
 * - 查詢退款記錄
 * - 查詢退款詳情
 * 
 * 用途：提供統一的退款管理 API 介面
 */

import { apiClient, ApiResponse } from './client';

/**
 * 退款狀態列舉
 */
export enum RefundStatus {
  PENDING = 'pending',           // 待審核
  APPROVED = 'approved',         // 已批准
  PROCESSING = 'processing',     // 處理中
  COMPLETED = 'completed',       // 已完成
  REJECTED = 'rejected',         // 已拒絕
  CANCELLED = 'cancelled',       // 已取消
}

/**
 * 退款資訊結構
 */
interface Refund {
  id: string;
  refund_no: string;
  order_id: string;
  order_no: string;
  merchant_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * 退款列表查詢參數
 */
interface RefundQueryParams {
  page?: number;
  page_size?: number;
  status?: RefundStatus;
  start_date?: string;
  end_date?: string;
  order_no?: string;
  refund_no?: string;
  sort_by?: 'created_at' | 'amount';
  sort_order?: 'asc' | 'desc';
}

/**
 * 退款列表回應
 */
interface RefundListResponse {
  items: Refund[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 申請退款請求
 */
interface CreateRefundRequest {
  order_id: string;
  amount: number;
  reason: string;
  notes?: string;
}

/**
 * 申請退款回應
 */
interface CreateRefundResponse {
  refund_id: string;
  refund_no: string;
  status: RefundStatus;
  created_at: string;
}

/**
 * 查詢退款列表 API
 * 
 * @param {RefundQueryParams} params - 查詢參數
 * @returns {Promise<ApiResponse<RefundListResponse>>} 退款列表
 * 
 * @example
 * const response = await refundsApi.getRefunds({
 *   page: 1,
 *   page_size: 20,
 *   status: RefundStatus.COMPLETED
 * });
 */
export async function getRefunds(
  params?: RefundQueryParams
): Promise<ApiResponse<RefundListResponse>> {
  const response = await apiClient.get<ApiResponse<RefundListResponse>>(
    '/refunds',
    { params }
  );
  return response.data;
}

/**
 * 查詢退款詳情 API
 * 
 * @param {string} refundId - 退款 ID
 * @returns {Promise<ApiResponse<Refund>>} 退款詳情
 * 
 * @example
 * const response = await refundsApi.getRefundDetail('REFUND123');
 * console.log(response.data.status);
 */
export async function getRefundDetail(refundId: string): Promise<ApiResponse<Refund>> {
  const response = await apiClient.get<ApiResponse<Refund>>(
    `/refunds/${refundId}`
  );
  return response.data;
}

/**
 * 申請退款 API
 * 
 * @param {CreateRefundRequest} data - 退款申請資料
 * @returns {Promise<ApiResponse<CreateRefundResponse>>} 申請結果
 * 
 * @example
 * const response = await refundsApi.createRefund({
 *   order_id: 'ORDER123',
 *   amount: 50.00,
 *   reason: 'Customer request',
 *   notes: 'Partial refund'
 * });
 */
export async function createRefund(
  data: CreateRefundRequest
): Promise<ApiResponse<CreateRefundResponse>> {
  const response = await apiClient.post<ApiResponse<CreateRefundResponse>>(
    '/refunds',
    data
  );
  return response.data;
}

/**
 * 取消退款申請 API
 * 僅適用於待審核或待處理的退款
 * 
 * @param {string} refundId - 退款 ID
 * @returns {Promise<ApiResponse>} 取消結果
 * 
 * @example
 * await refundsApi.cancelRefund('REFUND123');
 */
export async function cancelRefund(refundId: string): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/refunds/${refundId}/cancel`
  );
  return response.data;
}

export type {
  Refund,
  RefundQueryParams,
  RefundListResponse,
  CreateRefundRequest,
  CreateRefundResponse,
};
