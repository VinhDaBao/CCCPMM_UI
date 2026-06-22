import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../util/axios.customize';

export const useNotifications = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const res = await axios.get('/api/notifications', { params: { page, limit } });
      return res ?? { data: [], pagination: { totalItems: 0 } };
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await axios.put('/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const updateReadMutation = useMutation({
    mutationFn: async ({ id, isRead }) => {
      return await axios.put(`/api/notifications/${id}`, { isRead });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    ...query,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
    updateRead: updateReadMutation.mutateAsync,
    isUpdatingRead: updateReadMutation.isPending,
  };
};

export default useNotifications;
