import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBlocksApi,
  createBlockApi,
  updateBlockApi,
  deleteBlockApi
} from '../util/api';

export const useBlocks = (workspaceId, projectId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['blocks', workspaceId, projectId],
    queryFn: async () => {
      const res = await getAllBlocksApi(workspaceId, projectId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId && !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBlockApi(workspaceId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBlockApi(workspaceId, projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBlockApi(workspaceId, projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  return {
    ...query,
    createBlock: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBlock: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteBlock: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useBlocks;
