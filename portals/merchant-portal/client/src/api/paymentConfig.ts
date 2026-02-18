/**
 * 聚合支付平台 - 商戶端前端應用
 * 支付配置 API 模組
 * 
 * 本模組封裝所有與支付配置相關的 API 呼叫，包括：
 * - 查詢支付通道列表
 * - 查詢商戶支付配置
 * - 更新支付配置
 * - 管理 API Key
 * - 管理回調地址
 * 
 * 用途：提供統一的支付配置管理 API 介面
 */

import { apiClient, ApiResponse } from './client';

/**
 * 支付通道資訊結構
 */
interface PaymentChannel {
  id: string;
  name: string;
  code: string;
  type: 'fiat' | 'crypto';
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  supported_currencies: string[];
  fee_rate: number;
  min_amount?: number;
  max_amount?: number;
}

/**
 * 商戶支付配置結構
 */
interface MerchantPaymentConfig {
  merchant_id: string;
  enabled_channels: string[]; // 通道代碼列表
  default_channel?: string;
  callback_url?: string;
  webhook_secret?: string;
  supported_currencies: string[];
  created_at: string;
  updated_at: string;
}

/**
 * API Key 結構
 */
interface ApiKey {
  id: string;
  key: string;
  secret?: string;
  name: string;
  status: 'active' | 'inactive' | 'revoked';
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

/**
 * 回調地址結構
 */
interface CallbackUrl {
  id: string;
  url: string;
  event_types: string[];
  status: 'active' | 'inactive';
  retry_count: number;
  last_triggered_at?: string;
  created_at: string;
}

/**
 * 查詢支付通道列表 API
 * 
 * @returns {Promise<ApiResponse<PaymentChannel[]>>} 支付通道列表
 * 
 * @example
 * const response = await paymentConfigApi.getPaymentChannels();
 * console.log(response.data);
 */
export async function getPaymentChannels(): Promise<ApiResponse<PaymentChannel[]>> {
  const response = await apiClient.get<ApiResponse<PaymentChannel[]>>(
    '/payment-channels'
  );
  return response.data;
}

/**
 * 查詢商戶支付配置 API
 * 
 * @returns {Promise<ApiResponse<MerchantPaymentConfig>>} 商戶支付配置
 * 
 * @example
 * const response = await paymentConfigApi.getMerchantPaymentConfig();
 * console.log(response.data.enabled_channels);
 */
export async function getMerchantPaymentConfig(): Promise<
  ApiResponse<MerchantPaymentConfig>
> {
  const response = await apiClient.get<ApiResponse<MerchantPaymentConfig>>(
    '/merchants/payment-config'
  );
  return response.data;
}

/**
 * 更新商戶支付配置 API
 * 
 * @param {Partial<MerchantPaymentConfig>} data - 要更新的配置資料
 * @returns {Promise<ApiResponse<MerchantPaymentConfig>>} 更新後的配置
 * 
 * @example
 * const response = await paymentConfigApi.updateMerchantPaymentConfig({
 *   enabled_channels: ['ALIPAY', 'WECHAT_PAY'],
 *   default_channel: 'ALIPAY',
 *   callback_url: 'https://example.com/callback'
 * });
 */
export async function updateMerchantPaymentConfig(
  data: Partial<MerchantPaymentConfig>
): Promise<ApiResponse<MerchantPaymentConfig>> {
  const response = await apiClient.put<ApiResponse<MerchantPaymentConfig>>(
    '/merchants/payment-config',
    data
  );
  return response.data;
}

/**
 * 查詢 API Key 列表 API
 * 
 * @returns {Promise<ApiResponse<ApiKey[]>>} API Key 列表
 * 
 * @example
 * const response = await paymentConfigApi.getApiKeys();
 */
export async function getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
  const response = await apiClient.get<ApiResponse<ApiKey[]>>(
    '/merchants/api-keys'
  );
  return response.data;
}

/**
 * 建立新 API Key API
 * 
 * @param {string} name - API Key 名稱
 * @returns {Promise<ApiResponse<ApiKey>>} 新建立的 API Key
 * 
 * @example
 * const response = await paymentConfigApi.createApiKey('Production Key');
 * console.log(response.data.key);
 */
export async function createApiKey(name: string): Promise<ApiResponse<ApiKey>> {
  const response = await apiClient.post<ApiResponse<ApiKey>>(
    '/merchants/api-keys',
    { name }
  );
  return response.data;
}

/**
 * 撤銷 API Key API
 * 
 * @param {string} keyId - API Key ID
 * @returns {Promise<ApiResponse>} 撤銷結果
 * 
 * @example
 * await paymentConfigApi.revokeApiKey('KEY123');
 */
export async function revokeApiKey(keyId: string): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `/merchants/api-keys/${keyId}/revoke`
  );
  return response.data;
}

/**
 * 查詢回調地址列表 API
 * 
 * @returns {Promise<ApiResponse<CallbackUrl[]>>} 回調地址列表
 * 
 * @example
 * const response = await paymentConfigApi.getCallbackUrls();
 */
export async function getCallbackUrls(): Promise<ApiResponse<CallbackUrl[]>> {
  const response = await apiClient.get<ApiResponse<CallbackUrl[]>>(
    '/merchants/callback-urls'
  );
  return response.data;
}

/**
 * 新增回調地址 API
 * 
 * @param {string} url - 回調地址 URL
 * @param {string[]} eventTypes - 事件類型列表
 * @returns {Promise<ApiResponse<CallbackUrl>>} 新增的回調地址
 * 
 * @example
 * const response = await paymentConfigApi.addCallbackUrl(
 *   'https://example.com/webhook',
 *   ['payment.completed', 'payment.failed']
 * );
 */
export async function addCallbackUrl(
  url: string,
  eventTypes: string[]
): Promise<ApiResponse<CallbackUrl>> {
  const response = await apiClient.post<ApiResponse<CallbackUrl>>(
    '/merchants/callback-urls',
    { url, event_types: eventTypes }
  );
  return response.data;
}

/**
 * 刪除回調地址 API
 * 
 * @param {string} callbackUrlId - 回調地址 ID
 * @returns {Promise<ApiResponse>} 刪除結果
 * 
 * @example
 * await paymentConfigApi.deleteCallbackUrl('CALLBACK123');
 */
export async function deleteCallbackUrl(callbackUrlId: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(
    `/merchants/callback-urls/${callbackUrlId}`
  );
  return response.data;
}

export type {
  PaymentChannel,
  MerchantPaymentConfig,
  ApiKey,
  CallbackUrl,
};
