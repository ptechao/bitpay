/**
 * 前言：本檔案定義分潤管理頁面
 * 用途：顯示分潤規則、分潤記錄、分潤報表
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Tabs, Table, Card, Statistic, message, Spin, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { getCommissionRecords, getCommissionReport } from '../api/business';
import { Commission } from '../types';

export const Commissions: React.FC = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<Commission[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getCommissionRecords(page, pagination.pageSize);
      if (response.code === 0 && response.data) {
        setRecords(response.data.items);
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

  const fetchReport = async () => {
    try {
      const response = await getCommissionReport();
      if (response.code === 0 && response.data) {
        setReport(response.data);
      }
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchReport();
  }, []);

  const recordColumns = [
    {
      title: t('transactions.orderId'),
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: t('commissions.rate'),
      dataIndex: 'commission_rate',
      key: 'commission_rate',
      render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
    },
    {
      title: t('dashboard.commissions'),
      dataIndex: 'commission_amount',
      key: 'commission_amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t('transactions.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs
        items={[
          {
            key: 'report',
            label: t('commissions.report'),
            children: (
              <Card>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title={t('dashboard.commissions')}
                      value={report?.total_commission || 0}
                      precision={2}
                      suffix="USD"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title={t('transactions.completed')}
                      value={report?.completed_count || 0}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title={t('dashboard.totalAmount')}
                      value={report?.total_transaction_amount || 0}
                      precision={2}
                      suffix="USD"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Statistic
                      title={t('commissions.percentage')}
                      value={report?.average_commission_rate || 0}
                      precision={4}
                      suffix="%"
                    />
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'records',
            label: t('commissions.records'),
            children: (
              <Table
                columns={recordColumns}
                dataSource={records}
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page) => fetchRecords(page),
                }}
                rowKey="id"
              />
            ),
          },
        ]}
      />
    </Spin>
  );
};
