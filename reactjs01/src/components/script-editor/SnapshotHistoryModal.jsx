import { Modal, Table, Tag, Button, Empty, Spin, notification } from 'antd';
import { LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import useProjectSnapshots from '../../hooks/useProjectSnapshots';
import dayjs from 'dayjs';

const SnapshotHistoryModal = ({ open, onCancel, workspaceId, projectId, canRestore }) => {
  const { data: snapshots = [], isLoading, restoreSnapshot, isRestoring } = useProjectSnapshots(workspaceId, projectId);

  const handleRestore = async (snapshotId) => {
    try {
      await restoreSnapshot(snapshotId);
      notification.success({
        message: 'Snapshot Restored',
        description: 'The project blocks have been successfully restored to this snapshot version.',
      });
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Restore Failed',
        description: error?.response?.data?.message || error?.message,
      });
    }
  };

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (v) => <Tag color="blue">v{v}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (t) => <strong style={{ color: 'var(--text-primary)' }}>{t || 'Untitled Snapshot'}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'snapshotType',
      key: 'snapshotType',
      render: (type) => (
        <Tag color={type === 'MANUAL' ? 'purple' : 'gold'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Summary',
      dataIndex: 'changeSummary',
      key: 'changeSummary',
      render: (summary) => summary || 'No description provided.',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (user) => user?.fullName || user?.email || 'Unknown',
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        if (!canRestore) return null;
        return (
          <Button
            type="primary"
            size="small"
            icon={<HistoryOutlined />}
            loading={isRestoring}
            onClick={() => handleRestore(record._id || record.id)}
            style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#000', fontWeight: 600 }}
          >
            Restore
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title="Snapshot History Log"
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
          dataSource={snapshots}
          columns={columns}
          rowKey={(record) => record._id || record.id}
          pagination={{ pageSize: 8 }}
          size="middle"
          locale={{
            emptyText: <Empty description="No snapshots saved yet" />,
          }}
        />
      )}
    </Modal>
  );
};

export default SnapshotHistoryModal;
