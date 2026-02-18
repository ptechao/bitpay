/**
 * 聚合支付平台 - 商戶端前端應用
 * 登入頁面
 * 
 * 本頁面提供商戶登入功能，包括：
 * - 使用者名稱和密碼輸入
 * - 登入表單驗證
 * - 登入狀態管理
 * - 錯誤提示
 * 
 * 用途：允許商戶登入系統
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * 登入頁面組件
 */
export default function Login() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  /**
   * 處理表單輸入變化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  /**
   * 處理登入提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 驗證表單
      if (!formData.username || !formData.password) {
        setError(t('errors.requiredField'));
        setLoading(false);
        return;
      }

      // 模擬登入請求
      // 實際應用中應調用 authApi.login()
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模擬成功登入
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('merchant_name', formData.username);

      // 重定向到儀表板
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 錯誤提示 */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* 使用者名稱輸入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('login.usernameLabel')}</label>
              <Input
                type="text"
                name="username"
                placeholder={t('login.usernameLabel')}
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* 密碼輸入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('login.passwordLabel')}</label>
              <Input
                type="password"
                name="password"
                placeholder={t('login.passwordLabel')}
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* 記住我 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                {t('login.rememberMe')}
              </label>
            </div>

            {/* 登入按鈕 */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('login.loginButton')
              )}
            </Button>

            {/* 忘記密碼連結 */}
            <div className="text-center text-sm">
              <a href="#" className="text-primary hover:underline">
                {t('login.forgotPassword')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
