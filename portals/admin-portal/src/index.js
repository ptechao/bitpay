/**
 * @file index.js
 * @description React 應用程式的入口檔案，負責渲染根組件並整合 i18next。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 引入基礎樣式
import App from './App';
import reportWebVitals from './reportWebVitals';
import './config/i18n'; // 引入 i18next 配置

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
