import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMember } from "../util/api";

const useRemoveMember = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      qc.invalidateQueries(["workspace-members"]);
    },
  });
};

export default useRemoveMember;