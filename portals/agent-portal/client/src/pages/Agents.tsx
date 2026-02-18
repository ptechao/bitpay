/**
 * 前言：本檔案定義下級代理管理頁面
 * 用途：顯示下級代理列表、開通、編輯、啟用/停用
 * 維護者：開發團隊
 */

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Spin, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getSubordinateAgents, createSubordinateAgent, updateSubordinateAgent } from '../api/agents';
import { Agent, AgentCreateRequest } from '../types';

export const Agents: React.FC = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchAgents = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getSubordinateAgents(page, pagination.pageSize);
      if (response.code === 0 && response.data) {
        setAgents(response.data.items);
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
    fetchAgents();
  }, []);

  const handleCreate = () => {
    setEditingAgent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    form.setFieldsValue(agent);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingAgent) {
        await updateSubordinateAgent(editingAgent.id, values);
        message.success(t('common.success'));
      } else {
        await createSubordinateAgent(values);
        message.success(t('common.success'));
      }
      setModalVisible(false);
      fetchAgents(pagination.current);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const columns = [
    {
      title: t('agents.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('agents.contactEmail'),
      dataIndex: 'contact_email',
      key: 'contact_email',
    },
    {
      title: t('agents.phoneNumber'),
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: t('agents.commissionType'),
      dataIndex: 'commission_rate_type',
      key: 'commission_rate_type',
      render: (type: string) => {
        const typeMap: any = {
          percentage: t('commissions.percentage'),
          fixed: t('commissions.fixed'),
          markup: t('commissions.markup'),
        };
        return typeMap[type] || type;
      },
    },
    {
      title: t('agents.commissionRate'),
      dataIndex: 'base_commission_rate',
      key: 'base_commission_rate',
      render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
    },
    {
      title: t('agents.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          active: <Tag color="green">{t('agents.active')}</Tag>,
          suspended: <Tag color="red">{t('agents.suspended')}</Tag>,
          pending: <Tag color="orange">{t('agents.pending')}</Tag>,
        };
        return statusMap[status] || status;
      },
    },
    {
      title: t('common.edit'),
      key: 'action',
      render: (_: any, record: Agent) => (
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
          {t('agents.create')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={agents}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchAgents(page),
        }}
        rowKey="id"
      />

      <Modal
        title={editingAgent ? t('agents.edit') : t('agents.create')}
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
            label={t('agents.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label={t('agents.contactPerson')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label={t('agents.contactEmail')}
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label={t('agents.phoneNumber')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="commission_rate_type"
            label={t('agents.commissionType')}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: t('commissions.percentage'), value: 'percentage' },
                { label: t('commissions.fixed'), value: 'fixed' },
                { label: t('commissions.markup'), value: 'markup' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="base_commission_rate"
            label={t('agents.commissionRate')}
            rules={[{ required: true, type: 'number' }]}
          >
            <Input type="number" step="0.0001" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
