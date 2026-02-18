/**
 * @file SystemSettingsPage.js
 * @description 系統設定頁面，包含管理員帳號管理、角色權限和系統參數。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const SystemSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('system.title')}>
      <Tabs defaultActiveKey="1">
        <TabPane tab={t('system.adminAccount')} key="1">
          <h3>{t('system.adminAccount')}</h3>
          <p>這裡將是管理員帳號管理的內容。</p>
          {/* TODO: 添加管理員帳號管理的表格和表單 */}
        </TabPane>
        <TabPane tab={t('system.rolePermission')} key="2">
          <h3>{t('system.rolePermission')}</h3>
          <p>這裡將是角色權限管理的內容。</p>
          {/* TODO: 添加角色權限管理的表格和表單 */}
        </TabPane>
        <TabPane tab={t('system.systemParams')} key="3">
          <h3>{t('system.systemParams')}</h3>
          <p>這裡將是系統參數設定的內容。</p>
          {/* TODO: 添加系統參數設定的表格和表單 */}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default SystemSettingsPage;
