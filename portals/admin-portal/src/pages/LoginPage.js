/**
 * @file LoginPage.js
 * @description 管理員登入頁面組件。
 * @author Manus AI
 * @date 2026-02-19
 */

import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios'; // 引入配置好的 axios 實例

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // 這裡假設登入 API 的路徑是 /auth/login
      const response = await axios.post('/auth/login', values);
      // 假設後端返回的數據中包含 token
      const { token } = response;
      localStorage.setItem('token', token);
      message.success(t('login.successMessage' || '登入成功'));
      navigate('/dashboard'); // 登入成功後導向儀表板
    } catch (error) {
      console.error('登入失敗:', error);
      message.error(error.message || t('login.errorMessage' || '登入失敗，請檢查使用者名稱或密碼'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title={t('login.title')} style={{ width: 360 }}>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('login.usernameRequired') || '請輸入使用者名稱!' }]} // 使用多語言鍵
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t('login.username')} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.passwordRequired') || '請輸入密碼!' }]} // 使用多語言鍵
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder={t('login.password')}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
              {t('login.loginButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
