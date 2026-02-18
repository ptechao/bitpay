/**
 * 前言：本檔案定義商戶管理頁面
 * 用途：顯示商戶列表、開通、編輯、結算週期設定
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Spin, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getMerchants, createMerchant, updateMerchant } from '../api/merchants';
import { Merchant } from '../types';

export const Merchants: React.FC = () => {
  const { t } = useTranslation();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchMerchants = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getMerchants(page, pagination.pageSize);
      if (response.code === 0 && response.data) {
        setMerchants(response.data.items);
        setPagination({
          current: page,
          pageSize: response.data.page_size,
          total: response.data.total,
        });
      }
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleCreate = () => {
    setEditingMerchant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    form.setFieldsValue(merchant);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMerchant) {
        await updateMerchant(editingMerchant.id, values);
        message.success(t('common.success'));
      } else {
        await createMerchant(values);
        message.success(t('common.success'));
      }
      setModalVisible(false);
      fetchMerchants(pagination.current);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const columns = [
    {
      title: t('merchants.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('merchants.contactEmail'),
      dataIndex: 'contact_email',
      key: 'contact_email',
    },
    {
      title: t('merchants.phoneNumber'),
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: t('merchants.website'),
      dataIndex: 'website',
      key: 'website',
    },
    {
      title: t('merchants.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          active: <Tag color="green">{t('merchants.active')}</Tag>,
          suspended: <Tag color="red">{t('merchants.suspended')}</Tag>,
          pending: <Tag color="orange">{t('common.confirm')}</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: t('common.edit'),
      key: 'action',
      render: (_: any, record: Merchant) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          {t('merchants.create')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={merchants}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchMerchants(page),
        }}
        rowKey="id"
      />

      <Modal
        title={editingMerchant ? t('merchants.edit') : t('merchants.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={t('merchants.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="legal_name"
            label={t('merchants.legalName')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label={t('merchants.contactPerson')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label={t('merchants.contactEmail')}
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label={t('merchants.phoneNumber')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('merchants.address')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="website"
            label={t('merchants.website')}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
