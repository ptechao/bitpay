/**
 * @file axios.js
 * @description Axios 請求實例配置與攔截器設定。
 * @author Manus AI
 * @date 2026-02-19
 */

import axios from 'axios';
import { message } from 'antd';

// 創建 Axios 實例
const service = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
  timeout: 10000, // 請求超時時間
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
service.interceptors.request.use(
  config => {
    // 在發送請求之前做些什麼
    // 例如：添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 對請求錯誤做些什麼
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  response => {
    // 對響應數據做些什麼
    const { code, msg, data } = response.data;
    if (code === 0) { // 假設 code 0 表示成功
      return data;
    } else {
      message.error(msg || '請求失敗');
      return Promise.reject(new Error(msg || '請求失敗'));
    }
  },
  error => {
    // 對響應錯誤做些什麼
    console.error('響應錯誤:', error);
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('未授權，請重新登入');
          // 可以導向登入頁面
          // window.location.href = '/login';
          break;
        case 403:
          message.error('拒絕訪問');
          break;
        case 404:
          message.error('請求資源不存在');
          break;
        case 500:
          message.error('伺服器內部錯誤');
          break;
        default:
          message.error(data.msg || '未知錯誤');
      }
    } else {
      message.error('網路錯誤或伺服器無響應');
    }
    return Promise.reject(error);
  }
);

export default service;
