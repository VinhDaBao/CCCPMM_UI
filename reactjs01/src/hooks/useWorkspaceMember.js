import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembers } from "../util/api";
const useWorkspaceMembers = (workspaceId) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const res = await getWorkspaceMembers(workspaceId);

      return res?.data ?? [];
    },
    enabled: !!workspaceId,
  });
};

export default useWorkspaceMembers;

