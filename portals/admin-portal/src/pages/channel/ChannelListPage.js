/**
 * @file ChannelListPage.js
 * @description 通道管理頁面，顯示通道列表。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Table, Button, Space, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const ChannelListPage = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('channel.channelName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('channel.currencyConfig'),
      dataIndex: 'currencyConfig',
      key: 'currencyConfig',
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
    { key: '1', name: '支付寶', status: t('common.enabled'), currencyConfig: 'CNY, USD' },
    { key: '2', name: '微信支付', status: t('common.disabled'), currencyConfig: 'CNY' },
    { key: '3', name: 'Visa', status: t('common.enabled'), currencyConfig: 'USD, EUR' },
  ];

  return (
    <Card title={t('channel.channelList')}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">{t('channel.addChannel')}</Button>
      </Space>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default ChannelListPage;
