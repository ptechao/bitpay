/**
 * @file OrderListPage.js
 * @description 訂單管理頁面，顯示支付訂單列表。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Table, Button, Space, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const OrderListPage = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: '訂單號',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '商戶名稱',
      dataIndex: 'merchantName',
      key: 'merchantName',
    },
    {
      title: '交易金額',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '訂單狀態',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('common.action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">{t('order.orderDetail')}</Button>
          <Button type="link">{t('order.refundManagement')}</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', orderId: 'ORD001', merchantName: '商戶A', amount: '100.00 USD', status: t('common.success') },
    { key: '2', orderId: 'ORD002', merchantName: '商戶B', amount: '50.00 TWD', status: t('common.pending') },
  ];

  return (
    <Card title={t('order.orderList')}>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default OrderListPage;
