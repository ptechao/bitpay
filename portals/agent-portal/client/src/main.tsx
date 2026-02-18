/**
 * 前言：本檔案是 React 應用程式的入口點
 * 用途：初始化 React 應用程式、i18n 多語言支援
 * 維護者：開發團隊
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './locales/i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
