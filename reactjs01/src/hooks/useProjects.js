import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  duplicateProjectApi
} from '../util/api';

export const useProjects = (workspaceId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const res = await getAllProjectsApi(workspaceId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createProjectApi(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProjectApi(workspaceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProjectApi(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => duplicateProjectApi(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  return {
    ...query,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    duplicateProject: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
  };
};

export default useProjects;
