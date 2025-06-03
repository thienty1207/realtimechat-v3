import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGroupChat, getUserFriends } from "../lib/api";
import toast from "react-hot-toast";
import { X, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  // Remove groupAvatar state as it's no longer needed
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen
  });

  const navigate = useNavigate();
  
  const createGroupMutation = useMutation({
    mutationFn: createGroupChat,
    onSuccess: (data) => {
      toast.success("Group chat created successfully!");
      
      // Invalidate all related queries
      queryClient.invalidateQueries(["groupChats"]);
      queryClient.invalidateQueries(["groupMembers"]);
      
      // Close modal
      onClose();
      resetForm();
      
      // Navigate with delay to ensure data is updated
      if (data?.group?.streamChannelId) {
        setTimeout(() => {
          navigate(`/group-chat/${data.group.streamChannelId}`, {
            state: { 
              group: data.group,
              forceRefresh: true 
            }
          });
        }, 200);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred while creating the group");
    }
  });

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers(new Set());
  };

  const handleMemberToggle = (friendId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedMembers.size === 0) {
      toast.error("Please select at least one member");
      return;
    }

    createGroupMutation.mutate({
      name: groupName.trim(),
      description: groupDescription.trim(),
      // Remove avatar field as backend will assign default image
      memberIds: Array.from(selectedMembers)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create group chat
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Name Group *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter your group name..."
              maxLength={50}
            />
          </div>

          {/* Remove avatar input section completely */}

          <div>
            <label className="label">
              <span className="label-text">Detail</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Detail your group chat..."
              maxLength={200}
              rows={3}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">
                Select your member ({selectedMembers.size} selected)
              </span>
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {friends.length === 0 ? (
                <p className="text-center text-base-content/70 py-4">
                  You don't have any friends yet
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                    onClick={() => handleMemberToggle(friend._id)}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedMembers.has(friend._id)}
                      onChange={() => handleMemberToggle(friend._id)}
                    />
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        {friend.profilePic ? (
                          <img src={friend.profilePic} alt={friend.fullName} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm">
                            {friend.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm">{friend.fullName}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={createGroupMutation.isLoading || !groupName.trim() || selectedMembers.size === 0}
            >
              {createGroupMutation.isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;