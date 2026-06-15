import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeMemberRole } from "../util/api.js";

const useChangeMemberRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: changeMemberRole,
    onSuccess: (_, vars) => {
      qc.invalidateQueries(["workspace-members", vars.workspaceId]);
    },
  });
};

export default useChangeMemberRole;