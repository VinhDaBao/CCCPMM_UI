import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Spin, Card, Button, Dropdown, Modal, Tooltip, notification, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, FolderOutlined } from '@ant-design/icons';
import useProjects from '../hooks/useProjects';
import useWorkspaces from '../hooks/useWorkspaces';
import ProjectModal from '../components/creator-layout/ProjectModal';
import TopBar from '../components/creator-layout/topBar';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Read activeWorkspaceId from CreatorLayout context
  const { activeWorkspaceId } = useOutletContext();

  // Query workspace members details to check user role
  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = workspaces.find(ws => String(ws._id || ws.id) === String(activeWorkspaceId));
  const memberRole = activeWorkspace?.memberRole || 'VIEWER';
  const canManageProjects = memberRole === 'OWNER' || memberRole === 'ADMIN';

  // React Query hooks for projects CRUD
  const {
    data: projects = [],
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects(activeWorkspaceId);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleCreateProjectClick = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (data) => {
    try {
      if (editingProject) {
        await updateProject({ id: editingProject._id || editingProject.id, data });
        notification.success({ message: 'Project updated successfully' });
      } else {
        await createProject(data);
        notification.success({ message: 'Project created successfully' });
      }
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      notification.error({
        message: 'Failed to save project',
        description: error?.response?.data?.message || error?.message
      });
    }
  };

  const handleDeleteProject = (project) => {
    const projectId = project._id || project.id;
    Modal.confirm({
      title: 'Delete Project?',
      content: `Are you sure you want to delete "${project.title}"? This cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteProject(projectId);
          notification.success({ message: 'Project deleted successfully' });
        } catch (error) {
          notification.error({
            message: 'Failed to delete project',
            description: error?.response?.data?.message || error?.message
          });
        }
      }
    });
  };

  const buildProjectMenu = (project) => ({
    items: [
      { key: 'edit', label: 'Edit Project', icon: <EditOutlined /> },
      { key: 'delete', label: 'Delete Project', danger: true, icon: <DeleteOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === 'edit') {
        setEditingProject(project);
        setProjectModalOpen(true);
      } else if (key === 'delete') {
        handleDeleteProject(project);
      }
    }
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>
      <TopBar title="Projects" subtitle="Manage and collaborate on movie & series scripts" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20
          }}>
            {/* Create Project Card */}
            {canManageProjects && (
              <div
                onClick={handleCreateProjectClick}
                style={{
                  height: 160,
                  borderRadius: 12,
                  border: '2px dashed var(--border-lit)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  e.currentTarget.style.color = 'var(--accent-amber)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                  e.currentTarget.style.borderColor = 'var(--border-lit)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Create Project</span>
              </div>
            )}

            {/* List Projects */}
            {projects.map((project) => {
              const projectId = project._id || project.id;

              const cardContent = (
                <Card
                  hoverable
                  onClick={() => navigate(`/projects/${projectId}`)}
                  style={{
                    height: 160,
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FolderOutlined style={{ color: 'var(--accent-amber)', fontSize: 16 }} />
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '80%' }}>
                        {project.title || 'Untitled Project'}
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      {project.description || 'No description provided.'}
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span style={{ fontSize: 10, padding: '2px 4px', color: 'var(--text-muted)' }}>
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              );

              return (
                <Tooltip
                  key={projectId}
                  title={
                    project.tags && project.tags.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {project.tags.map((t, idx) => (
                          <span key={idx} style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>{t}</span>
                        ))}
                      </div>
                    ) : 'No tags'
                  }
                  placement="top"
                  mouseEnterDelay={0.5}
                >
                  {canManageProjects ? (
                    <Dropdown
                      trigger={['contextMenu']}
                      menu={buildProjectMenu(project)}
                      placement="bottomLeft"
                    >
                      {cardContent}
                    </Dropdown>
                  ) : (
                    cardContent
                  )}
                </Tooltip>
              );
            })}
          </div>
        )}

        {!isLoading && projects.length === 0 && !canManageProjects && (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>
            No projects in this workspace yet.
          </div>
        )}
      </div>

      <ProjectModal
        open={projectModalOpen}
        onCancel={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;
