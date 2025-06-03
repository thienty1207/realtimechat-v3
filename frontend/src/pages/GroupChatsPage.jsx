import { useState } from "react";
import { Plus } from "lucide-react";
import GroupChatList from "../components/GroupChatList";
import CreateGroupModal from "../components/CreateGroupModal";

const GroupChatsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-base-300">
        <div>
          <h1 className="text-2xl font-bold">Group Chats</h1>
          <p className="text-base-content/70 mt-1">Manage your group conversations</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="size-4" />
          Create Group
        </button>
      </div>

      {/* Group Chat List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <GroupChatList />
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default GroupChatsPage;