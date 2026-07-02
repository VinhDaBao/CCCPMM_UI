import { useQuery } from '@tanstack/react-query';
import { getAllWorkspacesApi } from '../util/api';

const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await getAllWorkspacesApi();
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 60 * 1000,
  });
};

export default useWorkspaces;