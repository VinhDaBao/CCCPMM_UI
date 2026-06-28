import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { notification, Spin, Dropdown, Button, Modal, Tooltip, Avatar } from 'antd';
import { LoadingOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TopBar from '../components/creator-layout/TopBar';
import Icon from '../components/creator-layout/Icons';
import useProjects from '../hooks/useProjects';
import useWorkspaces from '../hooks/useWorkspaces';
import ProjectModal from '../components/creator-layout/ProjectModal';

const COLUMNS_DEF = {
  IDEA: { id: 'IDEA', title: 'Ý TƯỞNG', color: '#3b82f6' },
  WRITING: { id: 'WRITING', title: 'ĐANG VIẾT', color: '#d97706' },
  MEDIA: { id: 'MEDIA', title: 'LÀM MEDIA', color: '#9333ea' },
  PUBLISHED: { id: 'PUBLISHED', title: 'ĐÃ ĐĂNG', color: '#16a34a' }
};

const KanbanPage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useOutletContext();
  
  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = workspaces.find(ws => String(ws._id || ws.id) === String(activeWorkspaceId));
  const memberRole = activeWorkspace?.memberRole || 'VIEWER';
  const canManageProjects = memberRole === 'OWNER' || memberRole === 'ADMIN';

  const { 
    data: projects = [], 
    isLoading, 
    updateProject, 
    createProject,
    deleteProject 
  } = useProjects(activeWorkspaceId);

  const [columns, setColumns] = useState({});
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('IDEA');

  useEffect(() => {
    const board = { IDEA: [], WRITING: [], MEDIA: [], PUBLISHED: [] };
    projects.forEach(project => {
      if (board[project.status]) {
        board[project.status].push(project);
      }
    });
    setColumns(board);
  }, [projects]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const newColumns = { ...columns };
    const [movedProject] = newColumns[sourceStatus].splice(source.index, 1);
    movedProject.status = destStatus;
    newColumns[destStatus].splice(destination.index, 0, movedProject);
    setColumns(newColumns);

    if (sourceStatus !== destStatus) {
      try {
        await updateProject({ id: draggableId, data: { status: destStatus } });
      } catch (error) {
        notification.error({ message: 'Lỗi khi cập nhật trạng thái', description: error.message });
      }
    }
  };

  const handleOpenCreateModal = (status) => {
    setEditingProject(null);
    setDefaultStatus(status);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (data) => {
    try {
      if (editingProject) {
        await updateProject({ id: editingProject._id || editingProject.id, data });
        notification.success({ message: 'Cập nhật dự án thành công' });
      } else {
        const payload = { ...data, status: data.status || defaultStatus };
        await createProject(payload);
        notification.success({ message: 'Tạo dự án thành công' });
      }
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      notification.error({ message: 'Lỗi khi lưu dự án', description: error.message });
    }
  };

  const handleDeleteProject = (project) => {
    const projectId = project._id || project.id;
    Modal.confirm({
      title: 'Xóa dự án?',
      content: `Bạn có chắc chắn muốn xóa "${project.title}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await deleteProject(projectId);
          notification.success({ message: 'Xóa dự án thành công' });
        } catch (error) {
          notification.error({ message: 'Lỗi khi xóa dự án', description: error.message });
        }
      }
    });
  };

  const buildProjectMenu = (project) => ({
    items: [
      { key: 'edit', label: 'Edit Project', icon: <EditOutlined /> },
      { key: 'delete', label: 'Delete Project', danger: true, icon: <DeleteOutlined /> },
    ],
    onClick: (e) => {
      e.domEvent.stopPropagation();
      if (e.key === 'edit') {
        setEditingProject(project);
        setProjectModalOpen(true);
      } else if (e.key === 'delete') {
        handleDeleteProject(project);
      }
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-void)' }}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  const uniqueTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-void)' }}>
      <TopBar title="DashBoard" subtitle="Quản lý tiến độ kịch bản bằng kéo thả" />

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '24px', display: 'flex', gap: '20px' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(COLUMNS_DEF).map(([statusKey, colDef]) => (
            
            <Droppable key={statusKey} droppableId={statusKey}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column',
                    background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.05)' : 'var(--bg-base)',
                    borderRadius: '16px', border: '1px solid var(--border)',
                    transition: 'background 0.2s', height: '100%'
                  }}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-lit)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colDef.color }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                        {colDef.title}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>
                      {columns[statusKey]?.length || 0}
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {columns[statusKey]?.map((project, index) => {
                      const projectId = project._id || project.id;
                      
                      // 1. SỐ LƯỢNG ASSET
                      const assetCount = project.assetCount || project.assets?.length || project.projectAssets?.length || 0;

                      // 2. DANH SÁCH THÀNH VIÊN (Nếu không có mảng members thì hiện tạm người tạo)
                      const projectMembers = project.members?.length > 0 
                        ? project.members 
                        : (project.createdBy ? [project.createdBy] : []);

                      return (
                        <Draggable key={projectId} draggableId={projectId.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/projects/${projectId}`)}
                              style={{
                                background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: '12px',
                                padding: '16px', cursor: 'pointer',
                                boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
                                borderLeft: `4px solid ${colDef.color}`, 
                                ...provided.draggableProps.style
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {project.title}
                              </div>

                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                {project.tags?.map(tag => (
                                  <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                
                                {/* HIỂN THỊ SỐ FILE ĐÍNH KÈM */}
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Icon name="paperclip" size={12} /> {assetCount}
                                </div>
                                
                                {/* HIỂN THỊ DANH SÁCH AVATAR */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#000', backgroundColor: 'var(--accent-amber)' }}>
                                    {projectMembers.map((member, idx) => {
                                      // Đề phòng backend trả về ID chuỗi thay vì Object
                                      const name = typeof member === 'object' ? (member.fullName || member.email || 'Unknown') : 'Unknown';
                                      const initial = name.charAt(0).toUpperCase();
                                      
                                      return (
                                        <Tooltip title={name} key={member._id || idx}>
                                          <Avatar style={{ background: 'var(--accent-amber)', color: '#000', fontSize: '11px', fontWeight: 700 }}>
                                            {initial}
                                          </Avatar>
                                        </Tooltip>
                                      );
                                    })}
                                  </Avatar.Group>

                                  {canManageProjects && (
                                    <div 
                                      onClick={(e) => e.stopPropagation()} 
                                      onPointerDown={(e) => e.stopPropagation()} 
                                    >
                                      <Dropdown menu={buildProjectMenu(project)} trigger={['click']} placement="bottomRight">
                                        <Button 
                                          type="text" 
                                          size="small" 
                                          icon={<MoreOutlined style={{ fontSize: 16, color: 'var(--text-primary)' }} />} 
                                          style={{ padding: 0, width: 24, height: 24 }}
                                        />
                                      </Dropdown>
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>

                  <div style={{ padding: '0 16px 16px' }}>
                    {canManageProjects && (
                      <button 
                        onClick={() => handleOpenCreateModal(statusKey)}
                        style={{
                          width: '100%', padding: '10px', background: 'transparent', border: '1px dashed var(--border)', 
                          borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-amber)'; e.currentTarget.style.borderColor = 'var(--accent-amber)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <Icon name="plus" size={14} /> Create Project
                      </button>
                    )}
                  </div>

                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      <ProjectModal
        open={projectModalOpen}
        onCancel={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject} 
        initialValues={{ status: defaultStatus }}
        existingTags={uniqueTags}
      />
    </div>
  );
};

export default KanbanPage;