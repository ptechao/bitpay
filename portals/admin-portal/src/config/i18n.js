/**
 * @file i18n.js
 * @description i18next 多語言配置。
 * @author Manus AI
 * @date 2026-02-19
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 導入翻譯文件
import translationZhTw from '../locales/zh-TW/translation.json';
import translationZhCn from '../locales/zh-CN/translation.json';
import translationEn from '../locales/en/translation.json';
import translationJa from '../locales/ja/translation.json';
import translationKo from '../locales/ko/translation.json';
import translationTh from '../locales/th/translation.json';
import translationVi from '../locales/vi/translation.json';

const resources = {
  'zh-TW': {
    translation: translationZhTw,
  },
  'zh-CN': {
    translation: translationZhCn,
  },
  en: {
    translation: translationEn,
  },
  ja: {
    translation: translationJa,
  },
  ko: {
    translation: translationKo,
  },
  th: {
    translation: translationTh,
  },
  vi: {
    translation: translationVi,
  },
};

i18n
  .use(initReactI18next) // 將 i18n 實例傳遞給 react-i18next
  .init({
    resources,
    lng: 'zh-TW', // 預設語言
    fallbackLng: 'en', // 如果當前語言沒有翻譯，則使用英文
    interpolation: {
      escapeValue: false, // react 已經預防了 XSS 攻擊
    },
  });

export default i18n;
