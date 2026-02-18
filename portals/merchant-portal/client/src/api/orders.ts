/**
 * 聚合支付平台 - 商戶端前端應用
 * 訂單 API 模組
 * 
 * 本模組封裝所有與支付訂單相關的 API 呼叫，包括：
 * - 查詢訂單列表
 * - 查詢訂單詳情
 * - 建立支付訂單
 * - 查詢訂單狀態
 * 
 * 用途：提供統一的訂單管理 API 介面
 */

import { apiClient, ApiResponse } from './client';

/**
 * 訂單狀態列舉
 */
export enum OrderStatus {
  PENDING = 'pending',           // 待支付
  PROCESSING = 'processing',     // 處理中
  COMPLETED = 'completed',       // 已完成
  FAILED = 'failed',             // 已失敗
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded',         // 已退款
}

/**
 * 訂單資訊結構
 */
interface Order {
  id: string;
  order_no: string;
  merchant_id: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_channel: string;
  description: string;
  customer_email?: string;
  customer_phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * 訂單列表查詢參數
 */
interface OrderQueryParams {
  page?: number;
  page_size?: number;
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  order_no?: string;
  sort_by?: 'created_at' | 'amount';
  sort_order?: 'asc' | 'desc';
}

/**
 * 訂單列表回應
 */
interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 建立訂單請求
 */
interface CreateOrderRequest {
  amount: number;
  currency: string;
  description: string;
  customer_email?: string;
  customer_phone?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

/**
 * 建立訂單回應
 */
interface CreateOrderResponse {
  order_id: string;
  order_no: string;
  payment_url?: string;
  qr_code?: string;
  expires_at: string;
}

/**
 * 查詢訂單列表 API
 * 
 * @param {OrderQueryParams} params - 查詢參數
 * @returns {Promise<ApiResponse<OrderListResponse>>} 訂單列表
 * 
 * @example
 * const response = await ordersApi.getOrders({
 *   page: 1,
 *   page_size: 20,
 *   status: OrderStatus.COMPLETED,
 *   sort_by: 'created_at',
 *   sort_order: 'desc'
 * });
 */
export async function getOrders(
  params?: OrderQueryParams
): Promise<ApiResponse<OrderListResponse>> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(
    '/payments',
    { params }
  );
  return response.data;
}

/**
 * 查詢訂單詳情 API
 * 
 * @param {string} orderId - 訂單 ID
 * @returns {Promise<ApiResponse<Order>>} 訂單詳情
 * 
 * @example
 * const response = await ordersApi.getOrderDetail('ORDER123');
 * console.log(response.data.amount);
 */
export async function getOrderDetail(orderId: string): Promise<ApiResponse<Order>> {
  const response = await apiClient.get<ApiResponse<Order>>(
    `/payments/${orderId}`
  );
  return response.data;
}

/**
 * 建立支付訂單 API
 * 
 * @param {CreateOrderRequest} data - 訂單資料
 * @returns {Promise<ApiResponse<CreateOrderResponse>>} 建立結果，包含支付連結或二維碼
 * 
 * @example
 * const response = await ordersApi.createOrder({
 *   amount: 100.00,
 *   currency: 'USD',
 *   description: 'Product purchase',
 *   customer_email: 'customer@example.com'
 * });
 * window.location.href = response.data.payment_url;
 */
export async function createOrder(
  data: CreateOrderRequest
): Promise<ApiResponse<CreateOrderResponse>> {
  const response = await apiClient.post<ApiResponse<CreateOrderResponse>>(
    '/payments',
    data
  );
  return response.data;
}

/**
 * 查詢訂單狀態 API
 * 用於輪詢檢查訂單是否已支付
 * 
 * @param {string} orderId - 訂單 ID
 * @returns {Promise<ApiResponse<{ status: OrderStatus }>>} 訂單狀態
 * 
 * @example
 * const response = await ordersApi.checkOrderStatus('ORDER123');
 * if (response.data.status === OrderStatus.COMPLETED) {
 *   console.log('Payment successful');
 * }
 */
export async function checkOrderStatus(
  orderId: string
): Promise<ApiResponse<{ status: OrderStatus }>> {
  const response = await apiClient.get<ApiResponse<{ status: OrderStatus }>>(
    `/payments/${orderId}/status`
  );
  return response.data;
}

export type {
  Order,
  OrderQueryParams,
  OrderListResponse,
  CreateOrderRequest,
  CreateOrderResponse,
};
