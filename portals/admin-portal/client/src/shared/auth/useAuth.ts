// 前言：此檔案定義了 `useAuth` Hook，用於在 React 組件中方便地存取認證上下文。
// 它封裝了從 `AuthContext` 中獲取認證狀態和方法的邏輯，並在上下文未提供時拋出錯誤。

import { useContext } from 'react';
import { AuthContext } from './AuthProvider'; // 假設 AuthProvider 導出了 AuthContext

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用');
  }
  return context;
};

export default useAuth;
