/**
 * @file AgentListPage.js
 * @description 代理管理頁面，顯示代理列表。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Table, Button, Space, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const AgentListPage = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('agent.agentName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('agent.commissionRule'),
      dataIndex: 'commissionRule',
      key: 'commissionRule',
    },
    {
      title: t('common.action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">{t('common.edit')}</Button>
          <Button type="link">{t('common.detail')}</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: '代理A', status: t('common.active'), commissionRule: '百分比' },
    { key: '2', name: '代理B', status: t('common.inactive'), commissionRule: '固定金額' },
  ];

  return (
    <Card title={t('agent.agentList')}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">{t('agent.addAgent')}</Button>
      </Space>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default AgentListPage;
