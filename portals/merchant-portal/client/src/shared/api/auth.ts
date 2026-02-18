// 前言：此檔案定義了前端與後端認證 API 互動的方法。
// 包含了登入、註冊和刷新 Token 的功能，這些功能將呼叫後端自建的 JWT 認證服務。

import apiClient from './client';

interface AuthResponse {
  accessToken: string;
  user: any; // 根據實際用戶資料結構定義
}

export const login = async (credentials: any): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: any): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  // 假設後端有一個 /auth/refresh 端點來刷新 Token
  // 這裡可能需要將 refreshToken 放在請求體或請求頭中
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
};
