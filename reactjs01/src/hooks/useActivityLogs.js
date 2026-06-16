import { useQuery } from '@tanstack/react-query';
import { getWorkspaceActivityLogsApi } from '../util/api';

export const useActivityLogs = (workspaceId) => {
  return useQuery({
    queryKey: ['activity-logs', workspaceId],
    queryFn: async () => {
      const res = await getWorkspaceActivityLogsApi(workspaceId);
      return res?.data?.data ?? res?.data ?? [];
    },
    enabled: !!workspaceId,
  });
};

export default useActivityLogs;
