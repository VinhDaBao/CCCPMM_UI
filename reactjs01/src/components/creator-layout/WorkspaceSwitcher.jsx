import { useEffect, useRef, useState } from 'react';
import { Button, Divider, Dropdown, Empty, Form, Input, Modal, Select, Spin, notification } from 'antd';
import { DatabaseOutlined, DownOutlined, LoadingOutlined, PlusOutlined, DeleteOutlined, EditOutlined, CrownOutlined, SwapOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getWorkspaceMembers } from '../../util/api';
import useWorkspaces from '../../hooks/useWorkspaces';
import useCreateWorkspace from '../../hooks/useCreateWorkspace';
import useDeleteWorkspace from '../../hooks/useDeleteWorkspace';
import useUpdateWorkspace from '../../hooks/useUpdateWorkspace';

import useWorkspaceMembers from '../../hooks/useWorkspaceMember';
import useChangeMemberRole from '../../hooks/useChangeRole';
import useRemoveMember from '../../hooks/useRemoveMember';
import useLeaveWorkspace from '../../hooks/useLeave';
const STORAGE_KEY = 'active_workspace_id';

const WorkspaceSwitcher = () => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user || {};
  const ownerId = user?._id || user?.id;

  const [form] = Form.useForm();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [updateForm] = Form.useForm();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const lastErrorRef = useRef('');
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberWorkspace, setMemberWorkspace] = useState(null);
  const { data: members = [] } = useWorkspaceMembers(
    memberWorkspace?._id || memberWorkspace?.id
  );
  const myMember = members.find(
  (m) => m.userId?._id === user?._id
);
const [confirmState, setConfirmState] = useState({
  open: false,
  type: null, 
  member: null,
});
const myRole = myMember?.role;

const canManage = myRole === "OWNER";
const canChangeRole = myRole === "OWNER";
const canRemove = myRole === "OWNER";
  const {
    data: workspaces = [],
    isLoading,
    isError,
    error,
  } = useWorkspaces();
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const leaveWorkspaceMutation = useLeaveWorkspace();
  const createWorkspaceMutation = useCreateWorkspace(ownerId);
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const workspaceList = Array.isArray(workspaces) ? workspaces : [];
  const firstWorkspaceId = String(workspaceList[0]?._id || workspaceList[0]?.id || '');
  const hasStoredWorkspace = workspaceList.some((workspace) => String(workspace?._id || workspace?.id) === String(activeWorkspaceId));
  const selectedWorkspaceId = activeWorkspaceId && hasStoredWorkspace ? activeWorkspaceId : firstWorkspaceId;

  useEffect(() => {
    if (updateOpen && editingWorkspace) {
      updateForm.setFieldsValue({
        name: editingWorkspace.name,
        description: editingWorkspace.description,
      });
    }
  }, [updateOpen, editingWorkspace, updateForm]);
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
const openConfirm = (type, member) => {
  setConfirmState({
    open: true,
    type,
    member,
  });
};
const handleConfirm = async () => {
  const { type, member } = confirmState;

  if (!member || !memberWorkspace) return;

  const workspaceId = memberWorkspace._id || memberWorkspace.id;

  if (type === "remove") {
    await removeMember.mutateAsync({
      workspaceId,
      memberId: member._id,
    });
  }

  if (type === "transfer") {
    await changeRole.mutateAsync({
      workspaceId,
      memberId: member._id,
      role: "OWNER",
    });
  }

  setConfirmState({ open: false, type: null, member: null });
};
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
  const handleUpdateWorkspace = (workspace) => {
    setEditingWorkspace(workspace);

    updateForm.setFieldsValue({
      name: workspace?.name,
      description: workspace?.description,
    });

    setDropdownOpen(false);
    setUpdateOpen(true);
  };
  const handleUpdateWorkspaceSubmit = async (values) => {
    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId: editingWorkspace._id,
        data: values,
      });

      setUpdateOpen(false);
      setEditingWorkspace(null);
      updateForm.resetFields();
    } catch (error) {
      return error;
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

 const buildWorkspaceMenu = (workspace) => {
  const myMember = members.find(
    (m) => m.userId?._id === user?._id
  );

  const myRole = myMember?.role;

  const canManage = myRole === "OWNER" || myRole === "ADMIN";

  const items = [
    {
      key: "members",
      label: "Manage members",
      icon: <DatabaseOutlined />,
    },
  ];

  if (canManage) {
    items.push(
      {
        key: "update",
        label: "Update workspace",
        icon: <EditOutlined />,
      },
      {
        key: "delete",
        label: "Delete workspace",
        danger: true,
        icon: <DeleteOutlined />,
      }
    );
  }

  return {
    items,
    onClick: ({ key }) => {
      if (key === "members") {
        setMemberWorkspace(workspace);
        setMemberOpen(true);
      }

      if (key === "update") {
        handleUpdateWorkspace(workspace);
      }

      if (key === "delete") {
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
        popupRender={() => dropdownContent}
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
        destroyOnHidden
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
      <Modal
        title="Update workspace"
        open={updateOpen}
        onCancel={() => {
          setUpdateOpen(false);
          setEditingWorkspace(null);
          updateForm.resetFields();
        }}
        onOk={() => updateForm.submit()}
        okText="Update workspace"
        confirmLoading={updateWorkspaceMutation.isPending}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateWorkspaceSubmit}
          preserve={false}
        >
          <Form.Item
            label="Workspace name"
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter a workspace name',
              },
            ]}
          >
            <Input
              placeholder="e.g. Story Universe"
              maxLength={120}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              placeholder="Optional workspace description"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
     <Modal
  title="Workspace members"
  open={memberOpen}
  onCancel={() => {
    setMemberOpen(false);
    setMemberWorkspace(null);
  }}
  footer={null}
  width={650}
>
  {members.length === 0 ? (
    <Empty description="No members" />
  ) : (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div
          key={m._id}
          className="grid grid-cols-[1fr_140px_40px] items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          {/* USER INFO */}
          <div className="flex flex-col min-w-0">
            <div className="font-medium text-gray-900 truncate text-2xl ">
              {m.userId?.fullName || m.userId?.email}
            </div>

            <div className="text-xl text-gray-500 truncate">
              {m.userId?.email}
            </div>
          </div>

          {/* ROLE SELECT */}
          <div className="flex justify-center">
            {m.role === "OWNER" ? (
  <span className="text-amber-500 font-semibold">OWNER</span>
) : (
            <Select
              value={m.role}
              disabled={!canChangeRole || m.role === "OWNER"}
              className="w-[130px]"
              size="middle"
              onChange={(role) =>
                changeRole.mutate({
                  memberId: m._id,
                  role,
                })
              }
              options={[
                { value: "ADMIN", label: "ADMIN" },
                { value: "EDITOR", label: "EDITOR" },
                { value: "VIEWER", label: "VIEWER" },
              ]}
            />)}
          </div>

          {/* REMOVE ICON (FIX ALIGN) */}
<div className="flex justify-end gap-1">
  {/* TRANSFER OWNER */}
  {canChangeRole && m.role !== "OWNER" ? (
    <button
      onClick={() => openConfirm("transfer", m)}
      className="
        w-8 h-8 flex items-center justify-center
        rounded-md
        text-amber-500
        hover:bg-amber-100
        hover:text-amber-600
        transition
        relative
        group
      "
      title="Transfer owner"
    >
      <CrownOutlined className="text-lg group-hover:scale-110 transition" />
    </button>
  ) : (
    <div className="w-8 h-8" />
  )}

  {/* REMOVE */}
  {canRemove && m.role !== "OWNER" ? (
    <button
      onClick={() => openConfirm("remove", m)}
      className="
        w-8 h-8 flex items-center justify-center
        rounded-md
        text-red-500
        hover:bg-red-100
        hover:text-red-600
        transition
        text-base
      "
      title="Remove member"
    >
      <DeleteOutlined className="text-lg group-hover:scale-110 transition"  />
    </button>
  ) : (
    <div className="w-8 h-8" />
  )}
</div>
        </div>
      ))}
    </div>
  )}
  <Modal
  open={confirmState.open}
  onCancel={() =>
    setConfirmState({ open: false, type: null, member: null })
  }
  onOk={handleConfirm}
  okText="Confirm"
  cancelText="Cancel"
  centered
>
  {confirmState.type === "remove" && (
    <p>
      Remove <b>{confirmState.member?.userId?.fullName}</b> from workspace?
    </p>
  )}

  {confirmState.type === "transfer" && (
    <p>
      Transfer <b>OWNER</b> role to{" "}
      <b>{confirmState.member?.userId?.fullName}</b>?<br />
      You will lose owner permissions.
    </p>
  )}
</Modal>
</Modal>
    </div>

  );
};

export default WorkspaceSwitcher;