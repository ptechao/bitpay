/**
 * 聚合支付平台 - 商戶端前端應用
 * 結算查詢頁面
 * 
 * 本頁面提供結算查詢功能，包括：
 * - 結算單列表
 * - 結算詳情查看
 * - 提現申請
 * - 提現記錄查詢
 * 
 * 用途：管理結算和提現
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronRight } from 'lucide-react';

interface Settlement {
  id: string;
  settlementNo: string;
  period: string;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  withdrawalNo: string;
  amount: number;
  status: string;
  createdAt: string;
}

/**
 * 結算查詢頁面組件
 */
export default function Settlements() {
  const { t } = useTranslation();
  const [settlements] = useState<Settlement[]>([
    {
      id: '1',
      settlementNo: 'SET-2024-001',
      period: '2024-02-01 ~ 2024-02-15',
      totalAmount: 10000.00,
      totalFees: 200.00,
      netAmount: 9800.00,
      status: 'settled',
      createdAt: '2024-02-16',
    },
    {
      id: '2',
      settlementNo: 'SET-2024-002',
      period: '2024-02-16 ~ 2024-02-28',
      totalAmount: 15000.00,
      totalFees: 300.00,
      netAmount: 14700.00,
      status: 'pending',
      createdAt: '2024-02-19',
    },
  ]);

  const [withdrawals] = useState<Withdrawal[]>([
    {
      id: '1',
      withdrawalNo: 'WD-2024-001',
      amount: 9800.00,
      status: 'completed',
      createdAt: '2024-02-17',
    },
    {
      id: '2',
      withdrawalNo: 'WD-2024-002',
      amount: 5000.00,
      status: 'processing',
      createdAt: '2024-02-19',
    },
  ]);

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態文本
  const getSettlementStatusText = (status: string) => {
    switch (status) {
      case 'settled':
        return t('settlements.statusSettled');
      case 'pending':
        return t('settlements.statusPending');
      default:
        return status;
    }
  };

  const getWithdrawalStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('settlements.withdrawalStatusCompleted');
      case 'processing':
        return t('settlements.withdrawalStatusProcessing');
      case 'pending':
        return t('settlements.withdrawalStatusPending');
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('settlements.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('settlements.viewDetails')}</p>
        </div>

        {/* 標籤頁 */}
        <Tabs defaultValue="settlements" className="w-full">
          <TabsList>
            <TabsTrigger value="settlements">{t('settlements.title')}</TabsTrigger>
            <TabsTrigger value="withdrawals">{t('settlements.withdrawals')}</TabsTrigger>
          </TabsList>

          {/* 結算單標籤 */}
          <TabsContent value="settlements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settlements.title')}</CardTitle>
                <CardDescription>{settlements.length} {t('common.total')}</CardDescription>
              </CardHeader>
              <CardContent>
                {settlements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('settlements.noSettlements')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.settlementNo')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.period')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.totalAmount')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.totalFees')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.netAmount')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.status')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('common.action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settlements.map((settlement) => (
                          <tr key={settlement.id} className="border-b border-border hover:bg-accent/50">
                            <td className="py-3 px-4 font-medium">{settlement.settlementNo}</td>
                            <td className="py-3 px-4">{settlement.period}</td>
                            <td className="py-3 px-4">¥{settlement.totalAmount.toFixed(2)}</td>
                            <td className="py-3 px-4">¥{settlement.totalFees.toFixed(2)}</td>
                            <td className="py-3 px-4 font-semibold">¥{settlement.netAmount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(settlement.status)}`}>
                                {getSettlementStatusText(settlement.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 提現記錄標籤 */}
          <TabsContent value="withdrawals" className="space-y-4">
            <div className="flex justify-end">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('settlements.applyWithdrawal')}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('settlements.withdrawals')}</CardTitle>
                <CardDescription>{withdrawals.length} {t('common.total')}</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('settlements.noSettlements')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.withdrawalNo')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.withdrawalAmount')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.withdrawalStatus')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('settlements.createdAt')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="border-b border-border hover:bg-accent/50">
                            <td className="py-3 px-4 font-medium">{withdrawal.withdrawalNo}</td>
                            <td className="py-3 px-4">¥{withdrawal.amount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                                {getWithdrawalStatusText(withdrawal.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4">{withdrawal.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
