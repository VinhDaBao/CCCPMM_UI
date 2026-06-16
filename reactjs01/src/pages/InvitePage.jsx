import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button, Spin, Avatar, message } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import {
  workspaceInviteApi,
} from "../util/api";

import { useSelector } from "react-redux";
import { useEffect } from "react";
export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
const { user, isAuthenticated } = useSelector((state) => state.auth);

useEffect(() => {
  if (!isAuthenticated && token) {
    localStorage.setItem("pendingInviteToken", token);
    navigate("/login");
  }
}, [isAuthenticated, token, navigate]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => workspaceInviteApi.getByToken(token),
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      workspaceInviteApi.accept(token),

    onSuccess: () => {
      message.success("Invitation accepted");
      navigate("/");
    },

    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
        "Unable to accept invitation"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h2 className="text-white text-xl font-semibold">
            Invitation not found
          </h2>
        </div>
      </div>
    );
  }

  const invite = data;
  console.log("Invite data:", invite);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex items-center justify-center">
              <TeamOutlined className="text-3xl text-indigo-400" />
            </div>
          </div>

          <h1 className="text-white text-3xl font-bold text-center">
            Workspace Invitation
          </h1>

          <p className="text-slate-400 text-center mt-2">
            You've been invited to collaborate
          </p>

          <div className="mt-8 bg-slate-800/50 rounded-2xl p-5">
            <div>
              <p className="text-slate-400 text-sm">
                Workspace
              </p>

              <p className="text-white text-xl font-semibold">
                {invite.workspace.name}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-slate-400 text-sm">
                Description
              </p>

              <p className="text-slate-200">
                {invite.workspace.description ||
                  "No description"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Avatar size={48}>
              {invite.owner?.fullName?.charAt(0)}
            </Avatar>

            <div>
              <p className="text-white font-medium">
                {invite.owner?.fullName}
              </p>

              <p className="text-slate-400 text-sm">
                invited you
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">
                Role
              </p>

              <p className="text-white font-semibold">
                {invite.role}
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-sm">
                Expires
              </p>

              <p className="text-white font-semibold">
                {new Date(
                  invite.expiresAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            className="mt-8"
            loading={acceptMutation.isPending}
            onClick={() =>
              acceptMutation.mutate()
            }
          >
            Accept Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}