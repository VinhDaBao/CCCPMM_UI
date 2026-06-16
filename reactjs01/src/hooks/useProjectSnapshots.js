import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProjectSnapshotApi,
  getProjectSnapshotsApi,
  restoreProjectSnapshotApi
} from '../util/api';

export const useProjectSnapshots = (workspaceId, projectId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project-snapshots', workspaceId, projectId],
    queryFn: async () => {
      const res = await getProjectSnapshotsApi(workspaceId, projectId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId && !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: () => createProjectSnapshotApi(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-snapshots', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (snapshotId) => restoreProjectSnapshotApi(workspaceId, projectId, snapshotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  return {
    ...query,
    createSnapshot: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    restoreSnapshot: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
};

export default useProjectSnapshots;
