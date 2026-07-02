import { notification } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkspaceApi } from '../util/api';

const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, data }) => {
      return updateWorkspaceApi(workspaceId, data);
    },

    onSuccess: async (response) => {
      notification.success({
        message: 'Workspace updated',
        description:
          response?.message ?? 'Workspace updated successfully',
      });

      await queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
    },

    onError: (error) => {
      notification.error({
        message: 'Update workspace failed',
        description:
          error?.response?.data?.message ??
          error?.message ??
          'Unable to update workspace',
      });
    },
  });
};

export default useUpdateWorkspace;