import { useEffect, useRef, useState } from 'react';
import { Button, Divider, Dropdown, Empty, Form, Input, Modal, Select, Spin, notification } from 'antd';
import { DatabaseOutlined, DownOutlined, LoadingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useWorkspaces from '../../hooks/useWorkspaces';
import useCreateWorkspace from '../../hooks/useCreateWorkspace';
import useDeleteWorkspace from '../../hooks/useDeleteWorkspace';

const STORAGE_KEY = 'active_workspace_id';

const WorkspaceSwitcher = () => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user || {};
  const ownerId = user?._id || user?.id;

  const [form] = Form.useForm();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const lastErrorRef = useRef('');

  const {
    data: workspaces = [],
    isLoading,
    isError,
    error,
  } = useWorkspaces();

  const createWorkspaceMutation = useCreateWorkspace(ownerId);
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const workspaceList = Array.isArray(workspaces) ? workspaces : [];
  const firstWorkspaceId = String(workspaceList[0]?._id || workspaceList[0]?.id || '');
  const hasStoredWorkspace = workspaceList.some((workspace) => String(workspace?._id || workspace?.id) === String(activeWorkspaceId));
  const selectedWorkspaceId = activeWorkspaceId && hasStoredWorkspace ? activeWorkspaceId : firstWorkspaceId;

  useEffect(() => {
    if (selectedWorkspaceId && selectedWorkspaceId !== activeWorkspaceId) {
      localStorage.setItem(STORAGE_KEY, selectedWorkspaceId);
    }
  }, [activeWorkspaceId, selectedWorkspaceId]);

  useEffect(() => {
    if (!isError) {
      lastErrorRef.current = '';
      return;
    }

    const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Unable to load workspaces';
    if (lastErrorRef.current === errorMessage) {
      return;
    }

    lastErrorRef.current = errorMessage;
    notification.error({
      message: 'Workspace list failed',
      description: errorMessage,
    });
  }, [error, isError]);

  const activeWorkspace = workspaceList.find((workspace) => String(workspace?._id || workspace?.id) === String(selectedWorkspaceId));

  const handleWorkspaceChange = (workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem(STORAGE_KEY, workspaceId);
  };

  const handleOpenCreateWorkspace = () => {
    setDropdownOpen(false);
    setCreateOpen(true);
  };

  const handleCreateWorkspace = async (values) => {
    try {
      await createWorkspaceMutation.mutateAsync(values);
      form.resetFields();
      setCreateOpen(false);
    } catch (submitError) {
      return submitError;
    }
  };

  const handleDeleteWorkspace = (workspace) => {
    const workspaceId = String(workspace?._id || workspace?.id || '');
    const workspaceName = workspace?.name || 'Untitled workspace';

    if (!workspaceId) {
      return;
    }

    Modal.confirm({
      title: 'Delete workspace?',
      content: `Delete "${workspaceName}"? This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        const nextWorkspaces = workspaceList.filter((item) => String(item?._id || item?.id || '') !== workspaceId);

        await deleteWorkspaceMutation.mutateAsync(workspaceId);

        if (String(selectedWorkspaceId) === workspaceId) {
          const nextWorkspaceId = String(nextWorkspaces[0]?._id || nextWorkspaces[0]?.id || '');

          if (nextWorkspaceId) {
            setActiveWorkspaceId(nextWorkspaceId);
            localStorage.setItem(STORAGE_KEY, nextWorkspaceId);
          } else {
            setActiveWorkspaceId('');
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      },
    });
  };

  const buildWorkspaceMenu = (workspace) => ({
    items: [
      {
        key: 'delete',
        label: 'Delete workspace',
        danger: true,
        icon: <DeleteOutlined />,
      },
    ],
    onClick: ({ key }) => {
      if (key === 'delete') {
        handleDeleteWorkspace(workspace);
      }
    },
  });

  const workspaceOptions = workspaceList.map((workspace) => ({
    value: String(workspace?._id || workspace?.id || ''),
    label: workspace?.name || 'Untitled workspace',
  }));

  const dropdownContent = (
  <div style={{ width: '100%', maxWidth: 260 }}>
    
    <Button
      block
      type="text"
      icon={<PlusOutlined />}
      onClick={handleOpenCreateWorkspace}
      style={{
        justifyContent: 'flex-start',
        padding: '8px 10px',
        height: 'auto',
        color: 'var(--accent-amber)',
        fontWeight: 600,
      }}
    >
      Create workspace
    </Button>

    <Divider style={{ margin: '8px 0' }} />

    {/* 🔥 ADD THIS */}
    {workspaceList.length > 0 && (
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {workspaceList.map((ws) => (
          <Dropdown
            key={ws._id || ws.id}
            trigger={['contextMenu']}
            menu={buildWorkspaceMenu(ws)}
            placement="bottomLeft"
          >
            <div
              onClick={() => {
                handleWorkspaceChange(String(ws._id || ws.id));
                setDropdownOpen(false);
              }}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--bg-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <span style={{ fontSize: 13 }}>
                {ws.name || 'Untitled workspace'}
              </span>

              {String(ws._id || ws.id) === selectedWorkspaceId && (
                <span style={{ fontSize: 10, color: 'var(--accent-amber)' }}>
                  ACTIVE
                </span>
              )}
            </div>
          </Dropdown>
        ))}
      </div>
    )}

    {isLoading && (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    )}

    {!isLoading && workspaceList.length === 0 && (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: 'var(--text-muted)' }}>
            No workspaces yet
          </span>
        }
      />
    )}
  </div>
);
  return (
    <div style={{ padding: '12px 12px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Workspace
        </div>
        <DatabaseOutlined style={{ color: 'var(--accent-amber)', fontSize: 14 }} />
      </div>

      <Select
        value={selectedWorkspaceId || undefined}
        options={workspaceOptions}
        onChange={handleWorkspaceChange}
        onOpenChange={setDropdownOpen}
        open={dropdownOpen}
        loading={isLoading}
        placeholder="Select workspace"
        suffixIcon={<DownOutlined style={{ color: 'var(--text-muted)' }} />}
        dropdownRender={() => dropdownContent}
        style={{ width: '100%' }}
        variant="filled"
        allowClear={false}
        size="middle"
        showSearch={false}
        popupMatchSelectWidth
      />

      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-sage)', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeWorkspace?.name || 'No active workspace'}
        </span>
      </div>

      <Modal
        title="Create workspace"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Create workspace"
        confirmLoading={createWorkspaceMutation.isPending}
        destroyOnClose
        afterClose={() => form.resetFields()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkspace} preserve={false}>
          <Form.Item
            label="Workspace name"
            name="name"
            rules={[{ required: true, message: 'Please enter a workspace name' }]}
          >
            <Input placeholder="e.g. Story Universe" maxLength={120} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Optional workspace description" rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkspaceSwitcher;