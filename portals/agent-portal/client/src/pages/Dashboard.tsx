/**
 * 前言：本檔案定義儀表板頁面
 * 用途：顯示代理商總覽統計資訊
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, message } from 'antd';
import { TeamOutlined, ShopOutlined, DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getAgentStats } from '../api/agents';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAgentStats();
        if (response.code === 0 && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        message.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  return (
    <Spin spinning={loading}>
      <div>
        <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
          {t('dashboard.title')}
        </h1>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.subordinateAgents')}
                value={stats?.total_subordinate_agents || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.merchants')}
                value={stats?.total_merchants || 0}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.transactions')}
                value={stats?.total_transactions || 0}
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('dashboard.commissions')}
                value={stats?.total_commission || 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={t('dashboard.totalAmount')}>
              <Statistic
                value={stats?.total_transaction_amount || 0}
                precision={2}
                suffix="USD"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={t('dashboard.pendingSettlement')}>
              <Statistic
                value={stats?.pending_settlement || 0}
                precision={2}
                suffix="USD"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};
