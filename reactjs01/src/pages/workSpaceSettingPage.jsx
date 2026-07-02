import { Tabs } from "antd";
import MemberManagement from "./components/MemberManagement";
import InviteMember from "./components/InviteMember";

const WorkspaceSettingsPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Workspace Settings</h2>

      <Tabs
        items={[
          {
            key: "members",
            label: "Members",
            children: <MemberManagement />,
          },
          {
            key: "invite",
            label: "Invite Member",
            children: <InviteMember />,
          },
        ]}
      />
    </div>
  );
};

export default WorkspaceSettingsPage;