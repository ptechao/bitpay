// 前言：此檔案定義了前端 API 客戶端，負責處理 HTTP 請求的發送、錯誤處理以及 JWT Token 的管理。
// 它將 JWT Token 儲存在 localStorage 中，並在每次請求時附加到請求頭中。

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：在每個請求發送前，檢查是否存在 JWT Token，並將其附加到請求頭中
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器：處理 API 響應中的錯誤，例如 Token 過期
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 範例：如果 Token 過期 (401 Unauthorized)，可以嘗試刷新 Token 或導向登入頁面
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: Token might be expired or invalid.');
      // 這裡可以觸發登出流程或 Token 刷新機制
      // 例如：window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('jwt_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('jwt_token');
};

export default apiClient;
