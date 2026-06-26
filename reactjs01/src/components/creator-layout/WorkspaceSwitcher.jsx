import { useEffect, useRef, useState } from 'react';
import { Button, Divider, Dropdown, Empty, Modal, Select, Spin, notification } from 'antd';
import { DatabaseOutlined, DownOutlined, LoadingOutlined, PlusOutlined, DeleteOutlined, EditOutlined, UserSwitchOutlined, SettingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useWorkspaces from '../../hooks/useWorkspaces';
import useDeleteWorkspace from '../../hooks/useDeleteWorkspace';

import CreateWorkspaceModal from './CreateWorkspaceModal';
import UpdateWorkspaceModal from './UpdateWorkspaceModal';
import WorkspaceMembersModal from './WorkspaceMembersModal';
import WorkspaceInvitesModal from './WorkspaceInvitesModal';

const STORAGE_KEY = 'active_workspace_id';

const WorkspaceSwitcher = ({ activeWorkspaceId, setActiveWorkspaceId }) => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user || {};
  const ownerId = user?._id || user?.id;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const lastErrorRef = useRef('');
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberWorkspace, setMemberWorkspace] = useState(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState(null);

  const {
    data: workspaces = [],
    isLoading,
    isError,
    error,
  } = useWorkspaces();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const workspaceList = Array.isArray(workspaces) ? workspaces : [];
  const firstWorkspaceId = String(workspaceList[0]?._id || workspaceList[0]?.id || '');
  const hasStoredWorkspace = workspaceList.some((workspace) => String(workspace?._id || workspace?.id) === String(activeWorkspaceId));
  const selectedWorkspaceId = activeWorkspaceId && hasStoredWorkspace ? activeWorkspaceId : firstWorkspaceId;

  useEffect(() => {
    if (selectedWorkspaceId && selectedWorkspaceId !== activeWorkspaceId) {
      localStorage.setItem(STORAGE_KEY, selectedWorkspaceId);
      setActiveWorkspaceId(selectedWorkspaceId);
    }
  }, [activeWorkspaceId, selectedWorkspaceId, setActiveWorkspaceId]);

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

  const handleUpdateWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setDropdownOpen(false);
    setUpdateOpen(true);
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

  const buildWorkspaceMenu = (workspace) => {
    const canManage = workspace.memberRole === 'OWNER' || workspace.memberRole === 'ADMIN';
    const canManageInvites = workspace.memberRole === 'OWNER';

    const items = [
      {
        key: 'members',
        label: 'Manage members',
        icon: <DatabaseOutlined />,
      },
    ];

    if (canManageInvites) {
      items.push({
        key: 'invites',
        label: 'Manage invites',
        icon: <UserSwitchOutlined />,
      });
    }

    if (canManage) {
      items.push(
        {
          key: 'update',
          label: 'Update workspace',
          icon: <EditOutlined />,
        },
        {
          key: 'delete',
          label: 'Delete workspace',
          danger: true,
          icon: <DeleteOutlined />,
        }
      );
    }

    return {
      items,
      onClick: ({ key }) => {
        if (key === 'members') {
          setMemberWorkspace(workspace);
          setMemberOpen(true);
        }

        if (key === 'invites') {
          setInviteWorkspace(workspace);
          setInviteOpen(true);
        }

        if (key === 'update') {
          handleUpdateWorkspace(workspace);
        }

        if (key === 'delete') {
          handleDeleteWorkspace(workspace);
        }
      },
    };
  };

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

      {workspaceList.length > 0 && (
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {workspaceList.map((ws) => (
            <div
              key={ws._id || ws.id}
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
                gap: '8px',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--bg-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ws.name || 'Untitled workspace'}
                </span>

                {String(ws._id || ws.id) === selectedWorkspaceId && (
                  <span style={{ fontSize: 10, color: 'var(--accent-amber)', flexShrink: 0 }}>
                    ACTIVE
                  </span>
                )}
              </div>

              <Dropdown
                menu={buildWorkspaceMenu(ws)}
                trigger={['click']}
                placement="bottomRight"
              >
                <SettingOutlined
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'var(--accent-amber)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                />
              </Dropdown>
            </div>
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Select
          value={selectedWorkspaceId || undefined}
          options={workspaceOptions}
          onChange={handleWorkspaceChange}
          onOpenChange={setDropdownOpen}
          open={dropdownOpen}
          loading={isLoading}
          placeholder="Select workspace"
          suffixIcon={<DownOutlined style={{ color: 'var(--text-muted)' }} />}
          popupRender={() => dropdownContent}
          style={{ flex: 1 }}
          variant="filled"
          allowClear={false}
          size="middle"
          showSearch={false}
          popupMatchSelectWidth
        />

        {activeWorkspace && (
          <Dropdown
            menu={buildWorkspaceMenu(activeWorkspace)}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<SettingOutlined />}
            />
          </Dropdown>
        )}
      </div>

      <CreateWorkspaceModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        ownerId={ownerId}
      />

      <UpdateWorkspaceModal
        open={updateOpen}
        onCancel={() => {
          setUpdateOpen(false);
          setEditingWorkspace(null);
        }}
        workspace={editingWorkspace}
      />

      <WorkspaceMembersModal
        open={memberOpen}
        onCancel={() => {
          setMemberOpen(false);
          setMemberWorkspace(null);
        }}
        workspace={memberWorkspace}
        user={user}
      />

      <WorkspaceInvitesModal
        open={inviteOpen}
        onCancel={() => {
          setInviteOpen(false);
          setInviteWorkspace(null);
        }}
        workspace={inviteWorkspace}
      />
    </div>
  );
};

export default WorkspaceSwitcher;