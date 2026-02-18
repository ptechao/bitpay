/**
 * 前言：本檔案定義結算查詢頁面
 * 用途：查看自己的結算單和提現記錄
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, message, Spin, Space, Tag } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getSettlements, getWithdrawals, requestWithdrawal } from '../api/business';
import { Settlement, Withdrawal } from '../types';

export const Settlements: React.FC = () => {
  const { t } = useTranslation();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [settlementPagination, setSettlementPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [withdrawalPagination, setWithdrawalPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchSettlements = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getSettlements(page, settlementPagination.pageSize);
      if (response.code === 0 && response.data) {
        setSettlements(response.data.items);
        setSettlementPagination({
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

  const fetchWithdrawals = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getWithdrawals(page, withdrawalPagination.pageSize);
      if (response.code === 0 && response.data) {
        setWithdrawals(response.data.items);
        setWithdrawalPagination({
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
    fetchSettlements();
    fetchWithdrawals();
  }, []);

  const handleWithdrawal = async (values: any) => {
    try {
      await requestWithdrawal(values.amount, values.bank_account);
      message.success(t('common.success'));
      setWithdrawalModalVisible(false);
      form.resetFields();
      fetchWithdrawals(withdrawalPagination.current);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const settlementColumns = [
    {
      title: t('settlements.settlementPeriod'),
      dataIndex: 'settlement_period',
      key: 'settlement_period',
    },
    {
      title: t('settlements.totalAmount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t('settlements.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          completed: <Tag color="green">{t('settlements.completed')}</Tag>,
          pending: <Tag color="orange">{t('settlements.pending')}</Tag>,
          failed: <Tag color="red">{t('settlements.failed')}</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: t('transactions.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const withdrawalColumns = [
    {
      title: t('dashboard.commissions'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: t('settlements.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          completed: <Tag color="green">{t('settlements.completed')}</Tag>,
          pending: <Tag color="orange">{t('settlements.pending')}</Tag>,
          processing: <Tag color="blue">Processing</Tag>,
          failed: <Tag color="red">{t('settlements.failed')}</Tag>,
        };
        return statusMap[status] || status;
      },
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
            key: 'settlements',
            label: t('settlements.title'),
            children: (
              <Table
                columns={settlementColumns}
                dataSource={settlements}
                loading={loading}
                pagination={{
                  current: settlementPagination.current,
                  pageSize: settlementPagination.pageSize,
                  total: settlementPagination.total,
                  onChange: (page) => fetchSettlements(page),
                }}
                rowKey="id"
              />
            ),
          },
          {
            key: 'withdrawals',
            label: t('settlements.withdrawals'),
            children: (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<DollarOutlined />}
                    onClick={() => setWithdrawalModalVisible(true)}
                  >
                    {t('common.add')}
                  </Button>
                </div>

                <Table
                  columns={withdrawalColumns}
                  dataSource={withdrawals}
                  loading={loading}
                  pagination={{
                    current: withdrawalPagination.current,
                    pageSize: withdrawalPagination.pageSize,
                    total: withdrawalPagination.total,
                    onChange: (page) => fetchWithdrawals(page),
                  }}
                  rowKey="id"
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={t('common.add')}
        open={withdrawalModalVisible}
        onCancel={() => setWithdrawalModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleWithdrawal}
        >
          <Form.Item
            name="amount"
            label={t('dashboard.commissions')}
            rules={[{ required: true, type: 'number' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item
            name="bank_account"
            label="Bank Account"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};
