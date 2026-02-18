/**
 * @file MainLayout.js
 * @description 應用程式的主要佈局組件，包含側邊欄導航和頂部導航。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  ShopOutlined,
  TeamOutlined,
  GatewayOutlined,
  FileTextOutlined,
  AccountBookOutlined,
  SafetyOutlined,
  SettingOutlined,
  LoginOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard.title'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'merchants',
      icon: <ShopOutlined />,
      label: t('merchant.title'),
      onClick: () => navigate('/merchants'),
    },
    {
      key: 'agents',
      icon: <TeamOutlined />,
      label: t('agent.title'),
      onClick: () => navigate('/agents'),
    },
    {
      key: 'channels',
      icon: <GatewayOutlined />,
      label: t('channel.title'),
      onClick: () => navigate('/channels'),
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: t('order.title'),
      onClick: () => navigate('/orders'),
    },
    {
      key: 'settlements',
      icon: <AccountBookOutlined />,
      label: t('settlement.title'),
      onClick: () => navigate('/settlements'),
    },
    {
      key: 'risk-control',
      icon: <SafetyOutlined />,
      label: t('risk.title'),
      onClick: () => navigate('/risk-control'),
    },
    {
      key: 'system-settings',
      icon: <SettingOutlined />,
      label: t('system.title'),
      onClick: () => navigate('/system-settings'),
    },
    {
      key: 'logout',
      icon: <LoginOutlined />,
      label: t('login.logout'), // 假設有一個登出翻譯鍵
      onClick: () => {
        // 執行登出邏輯，例如清除 token 並導向登入頁
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['dashboard']} mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: '16px',
            }}
          >
            <Outlet /> {/* 這裡會渲染子路由組件 */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
