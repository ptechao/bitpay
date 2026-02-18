/**
 * @file SettlementListPage.js
 * @description 結算管理頁面，顯示結算單列表。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Table, Button, Space, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const SettlementListPage = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: '結算單號',
      dataIndex: 'settlementId',
      key: 'settlementId',
    },
    {
      title: '商戶/代理名稱',
      dataIndex: 'entityName',
      key: 'entityName',
    },
    {
      title: '結算金額',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '結算狀態',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('common.action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">{t('common.detail')}</Button>
          <Button type="link">{t('settlement.withdrawalReview')}</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', settlementId: 'SET001', entityName: '商戶A', amount: '1000.00 USD', status: t('common.success') },
    { key: '2', settlementId: 'SET002', entityName: '代理B', amount: '200.00 TWD', status: t('common.pending') },
  ];

  return (
    <Card title={t('settlement.settlementList')}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">{t('settlement.manualSettlement')}</Button>
      </Space>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default SettlementListPage;
