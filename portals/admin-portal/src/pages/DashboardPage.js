/**
 * @file DashboardPage.js
 * @description 儀表板頁面組件，顯示總覽統計資訊。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { t } = useTranslation();

  // 模擬數據
  const dashboardData = {
    totalTransactions: 123456,
    totalAmount: 9876543.21,
    successRate: 99.85,
    channelStatus: 'All Green',
  };

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title={t('dashboard.totalTransactions')} value={dashboardData.totalTransactions} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('dashboard.totalAmount')} value={dashboardData.totalAmount} prefix="$" precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('dashboard.successRate')} value={dashboardData.successRate} suffix="%" precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('dashboard.channelStatus')} value={dashboardData.channelStatus} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
