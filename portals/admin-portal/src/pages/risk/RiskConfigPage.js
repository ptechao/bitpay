/**
 * @file RiskConfigPage.js
 * @description 風控管理頁面，包含風控規則配置和黑白名單管理。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const RiskConfigPage = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('risk.title')}>
      <Tabs defaultActiveKey="1">
        <TabPane tab={t('risk.ruleConfig')} key="1">
          <h3>{t('risk.ruleConfig')}</h3>
          <p>這裡將是風控規則配置的內容。</p>
          {/* TODO: 添加風控規則配置的表格和表單 */}
        </TabPane>
        <TabPane tab={t('risk.blacklistWhitelist')} key="2">
          <h3>{t('risk.blacklistWhitelist')}</h3>
          <p>這裡將是黑白名單管理的內容。</p>
          {/* TODO: 添加黑白名單管理的表格和表單 */}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default RiskConfigPage;
