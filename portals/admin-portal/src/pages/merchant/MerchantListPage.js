/**
 * @file MerchantListPage.js
 * @description 商戶管理頁面，顯示商戶列表。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Table, Button, Space, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const MerchantListPage = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('merchant.merchantName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('merchant.contactPerson'),
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: t('merchant.contactEmail'),
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: t('merchant.status'),
      dataIndex: 'status',
      key: 'status',
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
    { key: '1', name: '商戶A', contactPerson: '張三', contactEmail: 'zhangsan@example.com', status: t('common.active') },
    { key: '2', name: '商戶B', contactPerson: '李四', contactEmail: 'lisi@example.com', status: t('common.inactive') },
  ];

  return (
    <Card title={t('merchant.merchantList')}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">{t('merchant.addMerchant')}</Button>
      </Space>
      <Table columns={columns} dataSource={data} />
    </Card>
  );
};

export default MerchantListPage;
