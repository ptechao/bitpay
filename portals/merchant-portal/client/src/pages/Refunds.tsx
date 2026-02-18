/**
 * 聚合支付平台 - 商戶端前端應用
 * 退款管理頁面
 * 
 * 本頁面提供退款管理功能，包括：
 * - 退款申請列表
 * - 退款狀態查詢
 * - 申請新退款
 * - 退款詳情查看
 * 
 * 用途：管理所有退款申請
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface Refund {
  id: string;
  refundNo: string;
  orderNo: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

/**
 * 退款管理頁面組件
 */
export default function Refunds() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [refunds] = useState<Refund[]>([
    {
      id: '1',
      refundNo: 'REF-2024-001',
      orderNo: 'ORD-2024-001',
      amount: 100.00,
      reason: 'Customer request',
      status: 'completed',
      createdAt: '2024-02-19 10:30:00',
    },
    {
      id: '2',
      refundNo: 'REF-2024-002',
      orderNo: 'ORD-2024-002',
      amount: 50.00,
      reason: 'Partial refund',
      status: 'processing',
      createdAt: '2024-02-19 10:25:00',
    },
    {
      id: '3',
      refundNo: 'REF-2024-003',
      orderNo: 'ORD-2024-003',
      amount: 75.00,
      reason: 'Product defect',
      status: 'pending',
      createdAt: '2024-02-19 10:20:00',
    },
  ]);

  // 篩選退款
  const filteredRefunds = refunds.filter((refund) => {
    return (
      refund.refundNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('refunds.statusCompleted');
      case 'processing':
        return t('refunds.statusProcessing');
      case 'pending':
        return t('refunds.statusPending');
      case 'rejected':
        return t('refunds.statusRejected');
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('refunds.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('refunds.applyRefund')}</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('refunds.applyRefund')}
          </Button>
        </div>

        {/* 搜尋 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 退款列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('refunds.title')}</CardTitle>
            <CardDescription>{filteredRefunds.length} {t('common.total')}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRefunds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('refunds.noRefunds')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.refundNo')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.orderNo')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.refundAmount')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.reason')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.status')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('refunds.createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.map((refund) => (
                      <tr key={refund.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 px-4 font-medium">{refund.refundNo}</td>
                        <td className="py-3 px-4">{refund.orderNo}</td>
                        <td className="py-3 px-4">¥{refund.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{refund.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(refund.status)}`}>
                            {getStatusText(refund.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{refund.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
