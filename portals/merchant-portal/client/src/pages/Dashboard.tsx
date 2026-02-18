/**
 * 聚合支付平台 - 商戶端前端應用
 * 儀表板頁面
 * 
 * 本頁面提供商戶的主要統計資訊，包括：
 * - 今日交易筆數和金額
 * - 交易成功率
 * - 待結算金額
 * - 近期交易列表
 * - 交易趨勢圖表
 * 
 * 用途：為商戶提供業務概覽
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface DashboardStats {
  todayTransactions: number;
  todayAmount: number;
  successRate: number;
  pendingSettlements: number;
  recentTransactions: Array<{
    id: string;
    orderNo: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

/**
 * 儀表板頁面組件
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    todayTransactions: 1234,
    todayAmount: 45678.90,
    successRate: 98.5,
    pendingSettlements: 12345.67,
    recentTransactions: [
      {
        id: '1',
        orderNo: 'ORD-2024-001',
        amount: 100.00,
        status: 'completed',
        createdAt: '2024-02-19 10:30:00',
      },
      {
        id: '2',
        orderNo: 'ORD-2024-002',
        amount: 250.50,
        status: 'completed',
        createdAt: '2024-02-19 10:25:00',
      },
      {
        id: '3',
        orderNo: 'ORD-2024-003',
        amount: 75.00,
        status: 'pending',
        createdAt: '2024-02-19 10:20:00',
      },
    ],
  });

  useEffect(() => {
    // 這裡應該調用 merchantApi.getDashboardStats()
    // 暫時使用模擬資料
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.welcome')}, {localStorage.getItem('merchant_name') || '商戶'}
          </h1>
          <p className="text-muted-foreground mt-2">{t('dashboard.title')}</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 今日交易筆數 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('dashboard.todayTransactions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">筆</p>
            </CardContent>
          </Card>

          {/* 今日交易額 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                {t('dashboard.todayAmount')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{stats.todayAmount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">CNY</p>
            </CardContent>
          </Card>

          {/* 成功率 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                {t('dashboard.successRate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">成功率</p>
            </CardContent>
          </Card>

          {/* 待結算金額 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                {t('dashboard.pendingSettlements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{stats.pendingSettlements.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">待結算</p>
            </CardContent>
          </Card>
        </div>

        {/* 近期交易 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            <CardDescription>{t('dashboard.viewAll')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">{t('orders.orderNo')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('orders.amount')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('orders.status')}</th>
                    <th className="text-left py-3 px-4 font-medium">{t('orders.createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">{tx.orderNo}</td>
                      <td className="py-3 px-4">¥{tx.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {tx.status === 'completed' ? t('orders.statusCompleted') : t('orders.statusPending')}
                        </span>
                      </td>
                      <td className="py-3 px-4">{tx.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
