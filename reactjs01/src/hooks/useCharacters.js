import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCharactersApi,
  createCharacterApi,
  updateCharacterApi,
  deleteCharacterApi
} from '../util/api';

export const useCharacters = (workspaceId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['characters', workspaceId],
    queryFn: async () => {
      const res = await getAllCharactersApi(workspaceId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createCharacterApi(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCharacterApi(workspaceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });
    },
  });

  const deleteMutation = useMutation({
      mutationFn: (id) => deleteCharacterApi(workspaceId, id),
      onSuccess: () => {
        // Làm mới bộ đệm để danh sách nhân vật tự động biến mất trên UI
        queryClient.invalidateQueries({ queryKey: ['characters', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['activity-logs', workspaceId] });

        //ép làm mới bộ nhớ đệm của block :
        queryClient.invalidateQueries({ queryKey: ['blocks'] });
     },
  });

  return {
    ...query,
    createCharacter: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCharacter: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCharacter: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useCharacters;
