/**
 * 聚合支付平台 - 商戶端前端應用
 * i18next 多語言配置模組
 * 
 * 本模組負責初始化和配置 i18next 多語言系統，支援：
 * - 繁體中文 (zh-TW)
 * - 簡體中文 (zh-CN)
 * - 英文 (en-US)
 * - 日文 (ja-JP)
 * - 韓文 (ko-KR)
 * - 泰文 (th-TH)
 * - 越南文 (vi-VN)
 * 
 * 用途：為應用程式提供多語言支援
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 語言資源（本地定義）
import zhTW from './locales/zh-TW.json';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';
import koKR from './locales/ko-KR.json';
import thTH from './locales/th-TH.json';
import viVN from './locales/vi-VN.json';

/**
 * 初始化 i18next
 */
i18n
  // 自動偵測瀏覽器語言
  .use(LanguageDetector)
  // 集成 React
  .use(initReactI18next)
  // 初始化配置
  .init({
    // 預設語言
    fallbackLng: 'zh-TW',
    
    // 支援的語言列表
    supportedLngs: ['zh-TW', 'zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'th-TH', 'vi-VN'],
    
    // 本地語言資源
    resources: {
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
      'ja-JP': { translation: jaJP },
      'ko-KR': { translation: koKR },
      'th-TH': { translation: thTH },
      'vi-VN': { translation: viVN },
    },
    
    // 命名空間
    ns: ['translation'],
    defaultNS: 'translation',
    
    // 插值設定
    interpolation: {
      escapeValue: false, // React 已經防止 XSS
    },
    
    // 偵測器設定
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
