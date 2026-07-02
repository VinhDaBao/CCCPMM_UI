import { useState } from 'react';
import { Empty, Modal, Select, Spin } from 'antd';
import { CrownOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import useWorkspaceMembers from '../../hooks/useWorkspaceMember';
import useChangeMemberRole from '../../hooks/useChangeRole';
import useRemoveMember from '../../hooks/useRemoveMember';
import { useTranslation } from 'react-i18next';

const WorkspaceMembersModal = ({ open, onCancel, workspace, user }) => {
  const workspaceId = workspace?._id || workspace?.id;
  const { t } = useTranslation();

  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    member: null,
  });

  const myMember = members.find((m) => m.userId?._id === user?._id);
  const myRole = myMember?.role;

  const canChangeRole = myRole === 'OWNER';
  const canRemove = myRole === 'OWNER';

  const openConfirm = (type, member) => {
    setConfirmState({
      open: true,
      type,
      member,
    });
  };

  const handleConfirm = async () => {
    const { type, member } = confirmState;
    if (!member || !workspaceId) return;

    if (type === 'remove') {
      await removeMember.mutateAsync({
        workspaceId,
        memberId: member._id,
      });
    }

    if (type === 'transfer') {
      await changeRole.mutateAsync({
        workspaceId,
        memberId: member._id,
        role: 'OWNER',
      });
    }

    setConfirmState({ open: false, type: null, member: null });
  };

  return (
    <Modal
      title={t('workspace_members.title')}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={650}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin indicator={<LoadingOutlined spin />} />
        </div>
      ) : members.length === 0 ? (
        <Empty description={t('workspace_members.no_members')} />
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
                {m.role === 'OWNER' ? (
                  <span className="text-amber-500 font-semibold">{t('workspace_members.owner')}</span>
                ) : (
                  <Select
                    value={m.role}
                    disabled={!canChangeRole || m.role === 'OWNER'}
                    className="w-[130px]"
                    size="middle"
                    onChange={(role) =>
                      changeRole.mutate({
                        workspaceId,
                        memberId: m._id,
                        role,
                      })
                    }
                    options={[
                      { value: 'ADMIN', label: 'ADMIN' },
                      { value: 'EDITOR', label: 'EDITOR' },
                      { value: 'VIEWER', label: 'VIEWER' },
                    ]}
                  />
                )}
              </div>

              {/* REMOVE ICON (FIX ALIGN) */}
              <div className="flex justify-end gap-1">
                {/* TRANSFER OWNER */}
                {canChangeRole && m.role !== 'OWNER' ? (
                  <button
                    onClick={() => openConfirm('transfer', m)}
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
                    title={t('workspace_members.transfer_owner')}
                  >
                    <CrownOutlined className="text-lg group-hover:scale-110 transition" />
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}

                {/* REMOVE */}
                {canRemove && m.role !== 'OWNER' ? (
                  <button
                    onClick={() => openConfirm('remove', m)}
                    className="
                      w-8 h-8 flex items-center justify-center
                      rounded-md
                      text-red-500
                      hover:bg-red-100
                      hover:text-red-600
                      transition
                      text-base
                    "
                    title={t('workspace_members.remove_member')}
                  >
                    <DeleteOutlined className="text-lg group-hover:scale-110 transition" />
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
        okText={t('workspace_members.confirm_ok')}
        cancelText={t('workspace_members.confirm_cancel')}
        centered
      >
        {confirmState.type === 'remove' && (
          <p>
            {t('workspace_members.remove_confirm', { name: confirmState.member?.userId?.fullName })}
          </p>
        )}

        {confirmState.type === 'transfer' && (
          <p>
            {t('workspace_members.transfer_confirm', { name: confirmState.member?.userId?.fullName })}<br />
            {t('workspace_members.transfer_notice')}
          </p>
        )}
      </Modal>
    </Modal>
  );
};

export default WorkspaceMembersModal;
