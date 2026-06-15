import { useState } from 'react';
import { Button, DatePicker, Empty, Form, Input, Modal, Select, Table, Tag, Tooltip, notification } from 'antd';
import { CloseOutlined, MailOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { workspaceInviteApi } from '../../util/api';

const WorkspaceInvitesModal = ({ open, onCancel, workspace }) => {
  const workspaceId = workspace?._id || workspace?.id;
  const [form] = Form.useForm();

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
        message: 'Invitation Sent',
        description: 'The invitation email has been sent successfully.',
      });
      refetch();
      form.resetFields();
    },
    onError: (err) => {
      notification.error({
        message: 'Invitation Failed',
        description: err?.response?.data?.message ?? err?.message ?? 'Unable to send invitation.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (token) => workspaceInviteApi.cancel(token),
    onSuccess: () => {
      notification.success({
        message: 'Invitation Cancelled',
        description: 'The invitation has been cancelled and marked as expired.',
      });
      refetch();
    },
    onError: (err) => {
      notification.error({
        message: 'Cancel Failed',
        description: err?.response?.data?.message ?? err?.message ?? 'Unable to cancel invitation.',
      });
    },
  });

  const handleSendInvite = (values) => {
    if (!workspaceId) return;

    inviteMutation.mutate({
      workspaceId,
      email: values.email,
      role: values.role,
      expiresAt: values.expiresAt ? values.expiresAt.toISOString() : dayjs().add(7, 'day').toISOString(),
    });
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{text}</span>
      ),
    },
    {
      title: 'Role',
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
      title: 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
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
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const isExpired = dayjs(record.expiresAt).isBefore(dayjs());
        const isPending = record.status === 'PENDING' && !isExpired;

        if (!isPending) return null;

        return (
          <Tooltip title="Cancel invitation">
            <Button
              type="text"
              danger
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => cancelMutation.mutate(record.token)}
              loading={cancelMutation.isPending}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Modal
      title="Manage Workspace Invitations"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose
    >
      <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-hover)', borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-primary)' }}>
          Send New Invitation
        </h4>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSendInvite}
          initialValues={{
            role: 'VIEWER',
            expiresAt: dayjs().add(7, 'day'),
          }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
            style={{ flex: '1 1 180px', margin: 0 }}
          >
            <Input prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Collaborator's email" />
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
            <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Expires At" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ margin: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={inviteMutation.isPending}
              style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
            >
              Invite
            </Button>
          </Form.Item>
        </Form>
      </div>

      <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-primary)' }}>
        Pending Invitations
      </h4>

      <Table
        dataSource={invites}
        columns={columns}
        rowKey={(record) => record._id || record.token}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description="No pending invitations" />,
        }}
        size="middle"
      />
    </Modal>
  );
};

export default WorkspaceInvitesModal;
