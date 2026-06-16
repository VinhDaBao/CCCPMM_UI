import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCharactersApi,
  createCharacterApi,
  updateCharacterApi
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

  return {
    ...query,
    createCharacter: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCharacter: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export default useCharacters;
