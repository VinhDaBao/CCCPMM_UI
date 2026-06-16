import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllSnippetsApi,
  createSnippetApi,
  updateSnippetApi,
  deleteSnippetApi
} from '../util/api';

export const useSnippets = (workspaceId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['snippets', workspaceId],
    queryFn: async () => {
      const res = await getAllSnippetsApi(workspaceId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createSnippetApi(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSnippetApi(workspaceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSnippetApi(workspaceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });

  return {
    ...query,
    createSnippet: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSnippet: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSnippet: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useSnippets;
