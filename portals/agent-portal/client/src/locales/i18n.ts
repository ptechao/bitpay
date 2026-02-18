/**
 * 前言：本檔案配置 i18next 多語言支援
 * 用途：初始化多語言系統，支援繁體中文、簡體中文、英文、日文、韓文、泰文、越南文
 * 維護者：開發團隊
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './zh-TW.json';
import zhCN from './zh-CN.json';
import enUS from './en-US.json';
import jaJP from './ja-JP.json';
import koKR from './ko-KR.json';
import thTH from './th-TH.json';
import viVN from './vi-VN.json';

const resources = {
  'zh-TW': { translation: zhTW },
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP },
  'ko-KR': { translation: koKR },
  'th-TH': { translation: thTH },
  'vi-VN': { translation: viVN },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'zh-TW',
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
