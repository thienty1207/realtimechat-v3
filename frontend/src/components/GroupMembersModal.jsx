import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchGroupMembers, leaveGroup, deleteGroup, addMembersToGroup, getUserFriends, kickMember } from "../lib/api";
import { X, Search, Crown, Shield, LogOut, Trash2, Users, UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";

const GroupMembersModal = ({ isOpen, onClose, group, channelId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation to kick member
  const kickMemberMutation = useMutation({
    mutationFn: (memberId) => kickMember(group?._id, memberId), // Added optional chaining for group
    onSuccess: (data) => {
      toast.success(data.message || "Member kicked successfully");
      queryClient.invalidateQueries(["groupMembers", group?._id]); // Added optional chaining for group
      queryClient.invalidateQueries(["groupChats"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error kicking member");
    }
  });

  // Query to get friends list
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen && showAddMemberModal
  });

  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["groupMembers", group?._id, searchQuery],
    queryFn: () => searchGroupMembers(group._id, searchQuery),
    enabled: isOpen && !!group?._id,
    refetchOnWindowFocus: false
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => leaveGroup(group._id),
    onSuccess: () => {
      toast.success("Left group successfully");
      onClose();
      queryClient.removeQueries(["groupMembers", group._id]);
      queryClient.removeQueries(["chatToken"]);
      queryClient.invalidateQueries(["groupChats"]);
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error leaving group");
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => deleteGroup(group._id),
    onSuccess: () => {
      toast.success("Group deleted successfully");
      onClose();
      queryClient.removeQueries(["groupMembers", group._id]);
      queryClient.removeQueries(["chatToken"]);
      queryClient.invalidateQueries(["groupChats"]);
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error deleting group");
    }
  });

  // Mutation to add members
  const addMembersMutation = useMutation({
    mutationFn: (memberIds) => addMembersToGroup(group._id, memberIds),
    onSuccess: () => {
      toast.success("Members added successfully!");
      setShowAddMemberModal(false);
      setSelectedFriends(new Set());
      // Refresh both members list and group chats
      queryClient.invalidateQueries(["groupMembers", group._id]);
      queryClient.invalidateQueries(["groupChats"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error adding members");
    }
  });

  const handleLeaveGroup = () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      leaveGroupMutation.mutate();
    }
  };

  const handleDeleteGroup = () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation.mutate();
    }
  };

  const handleAddMembers = () => {
    if (selectedFriends.size === 0) {
      toast.error("Please select at least one friend");
      return;
    }
    addMembersMutation.mutate(Array.from(selectedFriends));
  };

  const handleFriendToggle = (friendId) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedFriends(new Set());
  };

  const isCreator = group?.creator?._id === authUser?._id;
  const isAdmin = group?.admins?.some(admin => admin._id === authUser?._id);
  const members = membersData?.members || [];

  // Filter friends not in group
  const availableFriends = friends.filter(friend => 
    !members.some(member => member._id === friend._id)
  );

  // Early return MUST be after all hook calls
  if (!isOpen) return null;

  const handleKickMember = (member) => {
    if (window.confirm(`Are you sure you want to kick ${member.fullName} from the group?`)) {
      kickMemberMutation.mutate(member._id);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  {group?.avatar ? (
                    <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Members ({members.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Member Button - Only for admins */}
          {(isCreator || isAdmin) && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn-primary btn-sm w-full"
              >
                <UserPlus className="w-4 h-4" />
                Add Members
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2 mb-4">
            {isLoadingMembers ? (
              <div className="text-center py-4">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            ) : members.length === 0 ? (
              <p className="text-center text-base-content/70 py-4">
                {searchQuery ? "No members found" : "No members in group"}
              </p>
            ) : (
              members.map((member) => {
                const isMemberCreator = member._id === group?.creator?._id;
                const isMemberAdmin = group?.admins?.some(admin => admin._id === member._id);
                const canKickMember = (isCreator || isAdmin) && 
                                    !isMemberCreator && 
                                    member._id !== authUser?._id;
                
                return (
                  <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        {member.profilePic ? (
                          <img src={member.profilePic} alt={member.fullName} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{member.fullName}</span>
                        {isMemberCreator && <Crown className="w-3 h-3 text-yellow-500" />}
                        {isMemberAdmin && !isMemberCreator && <Shield className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>

                    {/* Kick Button */}
                    {canKickMember && (
                      <button
                        onClick={() => handleKickMember(member)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
                        disabled={kickMemberMutation.isLoading}
                        title="Kick from group"
                      >
                        {kickMemberMutation.isLoading ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <UserMinus className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleLeaveGroup}
              className="btn btn-outline btn-error flex-1"
              disabled={leaveGroupMutation.isLoading}
            >
              {leaveGroupMutation.isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Leave Group
                </>
              )}
            </button>
            
            {isCreator && (
              <button
                onClick={handleDeleteGroup}
                className="btn btn-error flex-1"
                disabled={deleteGroupMutation.isLoading}
              >
                {deleteGroupMutation.isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Group
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Members
              </h3>
              <button
                onClick={handleCloseAddMemberModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Friends List */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {isLoadingFriends ? (
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              ) : availableFriends.length === 0 ? (
                <p className="text-center text-base-content/70 py-4">
                  No friends available to add to group
                </p>
              ) : (
                availableFriends.map((friend) => (
                  <div key={friend._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedFriends.has(friend._id)}
                      onChange={() => handleFriendToggle(friend._id)}
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
                    <span className="text-sm font-medium">{friend.fullName}</span>
                  </div>
                ))
              )}
            </div>

            {/* Add Button */}
            <div className="flex gap-2">
              <button
                onClick={handleCloseAddMemberModal}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMembers}
                className="btn btn-primary flex-1"
                disabled={selectedFriends.size === 0 || addMembersMutation.isLoading}
              >
                {addMembersMutation.isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  `Add (${selectedFriends.size})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupMembersModal;