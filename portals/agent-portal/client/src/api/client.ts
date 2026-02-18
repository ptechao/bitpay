/**
 * 前言：本檔案封裝 Axios HTTP 客戶端，提供統一的 API 請求介面
 * 用途：管理 API 基礎配置、請求/響應攔截、錯誤處理
 * 維護者：開發團隊
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * 建立 Axios 實例
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器：添加認證令牌
 */
axiosInstance.interceptors.request.use(
  (config) => {
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
 * 響應攔截器：處理統一響應格式和錯誤
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 清除令牌並重定向到登入頁
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
