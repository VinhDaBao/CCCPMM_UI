import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllProjectAssetsApi,
  createProjectAssetApi,
  attachProjectAssetsApi,
  deleteProjectAssetApi
} from '../util/api';

export const useProjectAssets = (workspaceId, projectId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project-assets', workspaceId, projectId],
    queryFn: async () => {
      const res = await getAllProjectAssetsApi(workspaceId, projectId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId && !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createProjectAssetApi(workspaceId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
    },
  });

  const attachMutation = useMutation({
    mutationFn: (assetIds) => attachProjectAssetsApi(workspaceId, projectId, assetIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProjectAssetApi(workspaceId, projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assets', workspaceId, projectId] });
    },
  });

  return {
    ...query,
    createProjectAsset: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    attachAssets: attachMutation.mutateAsync,
    isAttaching: attachMutation.isPending,
    deleteProjectAsset: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useProjectAssets;
