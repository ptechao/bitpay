/**
 * 聚合支付平台 - 商戶端前端應用
 * 認證 API 模組
 * 
 * 本模組封裝所有與使用者認證相關的 API 呼叫，包括：
 * - 商戶登入
 * - 登出
 * - 令牌刷新
 * - 取得使用者資訊
 * 
 * 用途：提供統一的認證 API 介面供應用程式使用
 */

import { apiClient, ApiResponse } from './client';

/**
 * 登入請求資料結構
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登入回應資料結構
 */
interface LoginResponse {
  token: string;
  merchant_id: string;
  merchant_name: string;
  user_id: string;
  email: string;
  expires_in: number;
}

/**
 * 使用者資訊結構
 */
interface UserInfo {
  id: string;
  username: string;
  email: string;
  merchant_id: string;
  merchant_name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

/**
 * 商戶登入 API
 * 
 * @param {LoginRequest} credentials - 登入憑證（使用者名稱和密碼）
 * @returns {Promise<ApiResponse<LoginResponse>>} 登入回應，包含 JWT 令牌和使用者資訊
 * 
 * @example
 * const response = await authApi.login({
 *   username: 'merchant_001',
 *   password: 'password123'
 * });
 * localStorage.setItem('auth_token', response.data.token);
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials
  );
  return response.data;
}

/**
 * 商戶登出 API
 * 
 * @returns {Promise<ApiResponse>} 登出回應
 * 
 * @example
 * await authApi.logout();
 * localStorage.removeItem('auth_token');
 */
export async function logout(): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>('/auth/logout');
  return response.data;
}

/**
 * 刷新 JWT 令牌 API
 * 當令牌即將過期時呼叫此 API 以取得新令牌
 * 
 * @returns {Promise<ApiResponse<LoginResponse>>} 包含新令牌的回應
 * 
 * @example
 * const response = await authApi.refreshToken();
 * localStorage.setItem('auth_token', response.data.token);
 */
export async function refreshToken(): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/refresh-token'
  );
  return response.data;
}

/**
 * 取得當前登入使用者的資訊 API
 * 
 * @returns {Promise<ApiResponse<UserInfo>>} 使用者資訊
 * 
 * @example
 * const response = await authApi.getCurrentUser();
 * console.log(response.data.merchant_name);
 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  const response = await apiClient.get<ApiResponse<UserInfo>>('/auth/me');
  return response.data;
}

/**
 * 修改密碼 API
 * 
 * @param {string} oldPassword - 舊密碼
 * @param {string} newPassword - 新密碼
 * @returns {Promise<ApiResponse>} 修改結果
 * 
 * @example
 * await authApi.changePassword('oldPass123', 'newPass456');
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
}

export type { LoginRequest, LoginResponse, UserInfo };
