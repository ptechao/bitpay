/**
 * 聚合支付平台 - 商戶端前端應用
 * 訂單管理頁面
 * 
 * 本頁面提供訂單管理功能，包括：
 * - 訂單列表展示
 * - 訂單篩選和搜尋
 * - 訂單詳情查看
 * - 訂單狀態管理
 * 
 * 用途：管理所有支付訂單
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  orderNo: string;
  amount: number;
  status: string;
  paymentChannel: string;
  createdAt: string;
}

/**
 * 訂單管理頁面組件
 */
export default function Orders() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNo: 'ORD-2024-001',
      amount: 100.00,
      status: 'completed',
      paymentChannel: 'Alipay',
      createdAt: '2024-02-19 10:30:00',
    },
    {
      id: '2',
      orderNo: 'ORD-2024-002',
      amount: 250.50,
      status: 'completed',
      paymentChannel: 'WeChat Pay',
      createdAt: '2024-02-19 10:25:00',
    },
    {
      id: '3',
      orderNo: 'ORD-2024-003',
      amount: 75.00,
      status: 'pending',
      paymentChannel: 'Credit Card',
      createdAt: '2024-02-19 10:20:00',
    },
    {
      id: '4',
      orderNo: 'ORD-2024-004',
      amount: 500.00,
      status: 'failed',
      paymentChannel: 'Bank Transfer',
      createdAt: '2024-02-19 10:15:00',
    },
  ]);

  // 篩選訂單
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.amount.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取狀態文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('orders.statusCompleted');
      case 'pending':
        return t('orders.statusPending');
      case 'failed':
        return t('orders.statusFailed');
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('orders.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('orders.filterByDate')}</p>
        </div>

        {/* 搜尋和篩選 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* 搜尋框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 狀態篩選 */}
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  {t('common.noData')}
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                >
                  {t('orders.statusCompleted')}
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                >
                  {t('orders.statusPending')}
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                >
                  {t('orders.statusFailed')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 訂單列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('orders.title')}</CardTitle>
            <CardDescription>{filteredOrders.length} {t('common.total')}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('orders.noOrders')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">{t('orders.orderNo')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('orders.amount')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('orders.paymentChannel')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('orders.status')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('orders.createdAt')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-accent/50">
                        <td className="py-3 px-4 font-medium">{order.orderNo}</td>
                        <td className="py-3 px-4">¥{order.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{order.paymentChannel}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{order.createdAt}</td>
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
      </div>
    </MainLayout>
  );
}
