/**
 * 前言：本檔案定義交易查詢頁面
 * 用途：查看所屬商戶的交易記錄
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Table, Card, Select, DatePicker, Button, Space, message, Spin, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getTransactions } from '../api/business';
import { Transaction } from '../types';
import dayjs from 'dayjs';

export const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<{
    status?: string;
    startDate?: string;
    endDate?: string;
  }>({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getTransactions({
        page,
        page_size: pagination.pageSize,
        status: filters.status,
        start_date: filters.startDate,
        end_date: filters.endDate,
      });
      if (response.code === 0 && response.data) {
        setTransactions(response.data.items);
        setPagination({
          current: page,
          pageSize: response.data.page_size,
          total: response.data.total,
        });
      }
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = () => {
    fetchTransactions(1);
  };

  const handleReset = () => {
    setFilters({ status: undefined, startDate: undefined, endDate: undefined });
  };

  const columns = [
    {
      title: t('transactions.orderId'),
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: t('transactions.merchant'),
      dataIndex: 'merchant_id',
      key: 'merchant_id',
    },
    {
      title: t('transactions.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t('transactions.currency'),
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: t('transactions.paymentMethod'),
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: t('transactions.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          completed: <Tag color="green">{t('transactions.completed')}</Tag>,
          pending: <Tag color="orange">{t('transactions.pending')}</Tag>,
          failed: <Tag color="red">{t('transactions.failed')}</Tag>,
          refunded: <Tag color="blue">{t('transactions.refunded')}</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: t('transactions.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <Card style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space wrap>
              <Select
                placeholder={t('transactions.status')}
                style={{ width: 150 }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: t('transactions.completed'), value: 'completed' },
                  { label: t('transactions.pending'), value: 'pending' },
                  { label: t('transactions.failed'), value: 'failed' },
                  { label: t('transactions.refunded'), value: 'refunded' },
                ]}
                allowClear
              />

              <DatePicker
                placeholder={t('transactions.createdAt')}
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(date) => setFilters({ ...filters, startDate: date?.format('YYYY-MM-DD') || undefined })}
              />

              <DatePicker
                placeholder={t('transactions.createdAt')}
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(date) => setFilters({ ...filters, endDate: date?.format('YYYY-MM-DD') || undefined })}
              />

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                {t('common.search')}
              </Button>

              <Button onClick={handleReset}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchTransactions(page),
          }}
          rowKey="id"
        />
      </div>
    </Spin>
  );
};
