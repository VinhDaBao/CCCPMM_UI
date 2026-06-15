import { useMutation } from "@tanstack/react-query";
import { leaveWorkspace } from "../util/api";

const useLeaveWorkspace = () => {
  return useMutation({
    mutationFn: leaveWorkspace,
  });
};
export default useLeaveWorkspace;