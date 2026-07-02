import { useState } from 'react';
import { Button, DatePicker, Empty, Form, Input, Modal, Select, Table, Tag, Tooltip, notification } from 'antd';
import { CloseOutlined, MailOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { workspaceInviteApi } from '../../util/api';
import { useTranslation } from 'react-i18next';

const WorkspaceInvitesModal = ({ open, onCancel, workspace }) => {
  const workspaceId = workspace?._id || workspace?.id;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const { data: invites = [], isLoading, refetch } = useQuery({
    queryKey: ['workspace-invites', workspaceId],
    queryFn: async () => {
      const res = await workspaceInviteApi.getByWorkspace(workspaceId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => workspaceInviteApi.invite(data),
    onSuccess: () => {
      notification.success({
        message: t('workspace_invites.sent_title'),
        description: t('workspace_invites.sent_desc'),
      });
      refetch();
      form.resetFields();
    },
    onError: (err) => {
      notification.error({
        message: t('workspace_invites.failed_title'),
        description: err?.response?.data?.message ?? err?.message ?? t('workspace_invites.failed_default'),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ workspaceId, token }) => workspaceInviteApi.cancel( workspaceId, token ),
    onSuccess: () => {
      notification.success({
        message: t('workspace_invites.cancelled_title'),
        description: t('workspace_invites.cancelled_desc'),
      });
      refetch();
    },
    onError: (err) => {
      notification.error({
        message: t('workspace_invites.cancel_failed_title'),
        description: err?.response?.data?.message ?? err?.message ?? t('workspace_invites.cancel_failed_default'),
      });
    },
  });

  const handleSendInvite = (values) => {
    if (!workspaceId) return;

    const expiresAt = values.expiresAt
      ? values.expiresAt.minute(0).second(0).millisecond(0).toISOString()
      : dayjs().add(7, 'day').hour(0).minute(0).second(0).millisecond(0).toISOString();

    inviteMutation.mutate({
      workspaceId,
      email: values.email,
      role: values.role,
      expiresAt,
    });
  };

  const columns = [
    {
      title: t('workspace_invites.col_email'),
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{text}</span>
      ),
    },
    {
      title: t('workspace_invites.col_role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'ADMIN') color = 'purple';
        if (role === 'EDITOR') color = 'cyan';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: t('workspace_invites.col_expires_at'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH'),
    },
    {
      title: t('workspace_invites.col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isExpired = dayjs(record.expiresAt).isBefore(dayjs());
        let finalStatus = status;
        if (status === 'PENDING' && isExpired) {
          finalStatus = 'EXPIRED';
        }

        let color = 'gold';
        if (finalStatus === 'ACCEPTED') color = 'green';
        if (finalStatus === 'EXPIRED') color = 'default';

        return <Tag color={color}>{finalStatus}</Tag>;
      },
    },
    {
      title: t('workspace_invites.col_action'),
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const isExpired = dayjs(record.expiresAt).isBefore(dayjs());
        const isPending = record.status === 'PENDING' && !isExpired;

        if (!isPending) return null;

        return (
          <Tooltip title={t('workspace_invites.cancel_invitation')}>
            <Button
              type="text"
              danger
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => cancelMutation.mutate({ workspaceId, token: record.token })}
              loading={cancelMutation.isPending}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Modal
      title={t('workspace_invites.title')}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose
    >
      <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-hover)', borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-primary)' }}>
          {t('workspace_invites.send_new_invitation')}
        </h4>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSendInvite}
          initialValues={{
            role: 'VIEWER',
            expiresAt: dayjs().add(7, 'day').hour(0).minute(0).second(0).millisecond(0),
          }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('workspace_invites.email_required') },
              { type: 'email', message: t('workspace_invites.email_invalid') },
            ]}
            style={{ flex: '1 1 180px', margin: 0 }}
          >
            <Input prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />} placeholder={t('workspace_invites.collaborator_email')} />
          </Form.Item>

          <Form.Item name="role" style={{ width: 110, margin: 0 }}>
            <Select
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'EDITOR', label: 'EDITOR' },
                { value: 'VIEWER', label: 'VIEWER' },
              ]}
            />
          </Form.Item>

          <Form.Item name="expiresAt" style={{ width: 180, margin: 0 }}>
            <DatePicker
              showTime={{ format: 'HH', defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
              format="YYYY-MM-DD HH"
              placeholder={t('workspace_invites.expires_at_placeholder')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item style={{ margin: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={inviteMutation.isPending}
              style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
            >
              {t('workspace_invites.invite_button')}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-primary)' }}>
        {t('workspace_invites.pending_invitations')}
      </h4>

      <Table
        dataSource={invites}
        columns={columns}
        rowKey={(record) => record._id || record.token}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description={t('workspace_invites.no_pending_invitations')} />,
        }}
        size="middle"
      />
    </Modal>
  );
};

export default WorkspaceInvitesModal;
