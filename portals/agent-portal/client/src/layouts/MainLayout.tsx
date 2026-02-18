/**
 * 前言：本檔案定義主佈局組件，包含側邊欄和頂部導航
 * 用途：為所有已認證頁面提供統一的佈局結構
 * 維護者：開發團隊
 */

import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
  SwapOutlined,
  AccountBookOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: any[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('common.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'agents',
      icon: <TeamOutlined />,
      label: t('agents.title'),
      onClick: () => navigate('/agents'),
    },
    {
      key: 'merchants',
      icon: <ShopOutlined />,
      label: t('merchants.title'),
      onClick: () => navigate('/merchants'),
    },
    {
      key: 'commissions',
      icon: <DollarOutlined />,
      label: t('commissions.title'),
      onClick: () => navigate('/commissions'),
    },
    {
      key: 'transactions',
      icon: <SwapOutlined />,
      label: t('transactions.title'),
      onClick: () => navigate('/transactions'),
    },
    {
      key: 'settlements',
      icon: <AccountBookOutlined />,
      label: t('settlements.title'),
      onClick: () => navigate('/settlements'),
    },
  ];

  const userMenuItems: any[] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: t('common.profile'),
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          background: '#001529',
        }}
      >
        <div
          style={{
            color: 'white',
            padding: '16px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {!collapsed && t('common.appName')}
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />

          <Dropdown menu={{ items: userMenuItems }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
