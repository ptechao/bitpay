/**
 * 聚合支付平台 - 商戶端前端應用
 * Axios API 客戶端配置模組
 * 
 * 本模組提供統一的 HTTP 請求客戶端配置，包括：
 * - 基礎 URL 設定
 * - 請求/回應攔截器
 * - 認證令牌管理
 * - 錯誤處理
 * 
 * 用途：為所有 API 呼叫提供統一的配置和攔截機制
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * API 通用回應結構
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: string;
}

/**
 * API 錯誤回應結構
 */
export interface ApiErrorResponse {
  code: number;
  message: string;
  details?: string;
}

/**
 * 建立 Axios 實例
 */
const apiClient: AxiosInstance = axios.create({
  // API 基礎 URL（可從環境變數設定）
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器
 * 在每個請求前添加認證令牌
 */
apiClient.interceptors.request.use(
  (config) => {
    // 從 localStorage 取得認證令牌
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 回應攔截器
 * 處理 API 回應和錯誤
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 直接返回回應資料
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // 處理 401 未授權錯誤 - 重定向到登入頁
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    // 處理其他錯誤
    const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
    console.error('API 錯誤:', errorMessage);
    
    return Promise.reject(error);
  }
);

export { apiClient };
