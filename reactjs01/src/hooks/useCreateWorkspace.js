import { notification } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkspaceApi } from '../util/api';

const useCreateWorkspace = (ownerId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const payload = {
        name: values?.name?.trim(),
        description: values?.description?.trim() ?? '',
      };

      if (ownerId) {
        payload.ownerId = ownerId;
      }

      return createWorkspaceApi(payload);
    },
    onSuccess: async (response) => {
      notification.success({
        message: 'Workspace created',
        description: response?.message ?? 'Workspace created successfully',
      });

      await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error) => {
      notification.error({
        message: 'Create workspace failed',
        description:
          error?.response?.data?.message ?? error?.message ?? 'Unable to create workspace',
      });
    },
  });
};

export default useCreateWorkspace;