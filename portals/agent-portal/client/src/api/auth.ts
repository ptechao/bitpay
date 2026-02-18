/**
 * 前言：本檔案提供認證相關的 API 呼叫
 * 用途：登入、登出、獲取使用者資訊等認證操作
 * 維護者：開發團隊
 */

import axiosInstance from './client';
import { LoginRequest, LoginResponse, User, ApiResponse } from '../types';

/**
 * 使用者登入
 */
export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return axiosInstance.post('/auth/login', data);
};

/**
 * 使用者登出
 */
export const logout = (): Promise<ApiResponse<null>> => {
  return axiosInstance.post('/auth/logout');
};

/**
 * 獲取當前使用者資訊
 */
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return axiosInstance.get('/auth/me');
};

/**
 * 修改密碼
 */
export const changePassword = (
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<null>> => {
  return axiosInstance.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

/**
 * 更新使用者資訊
 */
export const updateProfile = (data: Partial<User>): Promise<ApiResponse<User>> => {
  return axiosInstance.put('/auth/profile', data);
};
