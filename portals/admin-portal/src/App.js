/**
 * @file App.js
 * @description React 應用程式的根組件，負責設定路由。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MerchantListPage from './pages/merchant/MerchantListPage';
import AgentListPage from './pages/agent/AgentListPage';
import ChannelListPage from './pages/channel/ChannelListPage';
import OrderListPage from './pages/order/OrderListPage';
import SettlementListPage from './pages/settlement/SettlementListPage';
import RiskConfigPage from './pages/risk/RiskConfigPage';
import SystemSettingsPage from './pages/system/SystemSettingsPage';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="merchants" element={<MerchantListPage />} />
          <Route path="agents" element={<AgentListPage />} />
          <Route path="channels" element={<ChannelListPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="settlements" element={<SettlementListPage />} />
          <Route path="risk-control" element={<RiskConfigPage />} />
          <Route path="system-settings" element={<SystemSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
