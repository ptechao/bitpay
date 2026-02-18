/**
 * 聚合支付平台 - 商戶端前端應用
 * 主佈局組件
 * 
 * 本組件提供應用的主要佈局結構，包括：
 * - 頂部導航欄
 * - 側邊欄菜單
 * - 主要內容區域
 * - 頁腳
 * 
 * 用途：為所有頁面提供統一的佈局框架
 */

import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主佈局組件
 * 提供頂部導航、側邊欄和主要內容區域
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);

  // 菜單項目
  const menuItems = [
    { label: t('common.dashboard'), path: '/dashboard', icon: '📊' },
    { label: t('common.orders'), path: '/orders', icon: '📋' },
    { label: t('common.refunds'), path: '/refunds', icon: '💰' },
    { label: t('common.settlements'), path: '/settlements', icon: '💳' },
    { label: t('common.paymentConfig'), path: '/payment-config', icon: '⚙️' },
    { label: t('common.cashier'), path: '/cashier', icon: '🏪' },
    { label: t('common.settings'), path: '/settings', icon: '👤' },
  ];

  // 語言選項
  const languages = [
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'th-TH', name: 'ไทย' },
    { code: 'vi-VN', name: 'Tiếng Việt' },
  ];

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  // 處理語言切換
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 側邊欄 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="text-xl font-bold text-primary">
            {sidebarOpen ? '支付平台' : '支'}
          </div>
        </div>

        {/* 菜單 */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 text-foreground"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* 登出按鈕 */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>

      {/* 主要內容 */}
      <div className="flex-1 flex flex-col">
        {/* 頂部導航欄 */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              {t('common.appName')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* 語言選擇 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguageOpen(!languageOpen)}
              >
                <Globe className="w-5 h-5" />
              </Button>
              {languageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors text-sm"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 設定按鈕 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* 內容區域 */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
