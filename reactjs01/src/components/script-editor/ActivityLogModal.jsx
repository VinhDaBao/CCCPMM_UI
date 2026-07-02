import { Modal, Table, Tag, Empty, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useActivityLogs from '../../hooks/useActivityLogs';
import dayjs from 'dayjs';

const ActivityLogModal = ({ open, onCancel, workspaceId }) => {
  const { data: logs = [], isLoading } = useActivityLogs(workspaceId);

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        let color = 'blue';
        if (action.includes('CREATE')) color = 'green';
        if (action.includes('DELETE')) color = 'red';
        if (action.includes('UPDATE')) color = 'orange';
        if (action.includes('RESTORE') || action.includes('DUPLICATE')) color = 'purple';
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (type) => <Tag color="cyan">{type}</Tag>,
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {user?.fullName || user?.email || 'System'}
        </span>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'metadata',
      key: 'metadata',
      render: (meta) => {
        if (!meta) return '-';
        return (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {Object.entries(meta).map(([key, val]) => (
              <div key={key}>
                <strong>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <Modal
      title="Workspace Activity Timeline"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      ) : (
        <Table
          dataSource={logs}
          columns={columns}
          rowKey={(record) => record._id || record.id}
          pagination={{ pageSize: 8 }}
          size="middle"
          locale={{
            emptyText: <Empty description="No activities logged yet" />,
          }}
        />
      )}
    </Modal>
  );
};

export default ActivityLogModal;
