import { notification } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkspaceApi } from '../util/api';

const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId) => {
      return deleteWorkspaceApi(workspaceId);
    },
    onSuccess: async (response) => {
      notification.success({
        message: 'Workspace deleted',
        description: response?.message ?? 'Workspace deleted successfully',
      });

      await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error) => {
      notification.error({
        message: 'Delete workspace failed',
        description:
          error?.response?.data?.message ?? error?.message ?? 'Unable to delete workspace',
      });
    },
  });
};

export default useDeleteWorkspace;