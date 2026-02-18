/**
 * 前言：本檔案定義個人設定頁面
 * 用途：修改密碼、個人資訊
 * 維護者：開發團隊
 */

import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { changePassword, updateProfile } from '../api/auth';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success(t('common.success'));
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(values.oldPassword, values.newPassword);
      message.success(t('common.success'));
      passwordForm.resetFields();
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tabs
        items={[
          {
            key: 'info',
            label: t('profile.personalInfo'),
            children: (
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  initialValues={user || {}}
                >
                  <Form.Item
                    name="username"
                    label={t('auth.username')}
                    rules={[{ required: true }]}
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={t('profile.email')}
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="phone_number"
                    label={t('profile.phoneNumber')}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                    >
                      {t('common.save')}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'password',
            label: t('profile.changePassword'),
            children: (
              <Card>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="oldPassword"
                    label={t('profile.oldPassword')}
                    rules={[{ required: true }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label={t('profile.newPassword')}
                    rules={[{ required: true, min: 6 }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={t('profile.confirmPassword')}
                    rules={[{ required: true }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                    >
                      {t('common.save')}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};
