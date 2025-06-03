import { useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import socket from '../lib/socket';
import { useNotificationStore } from '../store/useNotificationStore';
import useAuthUser from '../hooks/useAuthUser';
import { useQueryClient } from '@tanstack/react-query';

// Simple timestamp formatting function without using library
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minutes ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} days ago`;
  }
};

export default function SocketProvider({ children }) {
  const { authUser } = useAuthUser();
  const { addFriendRequest, addAcceptedRequest } = useNotificationStore();
  const queryClient = useQueryClient();

  // Memoize all event handlers with useCallback
  const handleConnect = useCallback(() => {
    if (authUser?._id) {
      console.log(`Socket connected, registering user: ${authUser._id}`);
      socket.emit('register', authUser._id);
    }
  }, [authUser]);

  const handleFriendRequest = useCallback((data) => {
    console.log('Friend request received:', data);
    addFriendRequest(data);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-full p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img className="h-10 w-10 rounded-full" src={data.sender.profilePic} alt="" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {data.sender.fullName}
              </p>
              <p className="mt-1 text-sm">
                Sent you a friend request
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 3000 });
  }, [addFriendRequest]);

  const handleFriendRequestAccepted = useCallback((data) => {
    console.log('Friend request accepted:', data);
    addAcceptedRequest(data);
    const currentFriends = queryClient.getQueryData(["friends"]) || [];
    const friendExists = currentFriends.some(friend => friend._id === data.recipient._id);
    if (!friendExists) {
      queryClient.setQueryData(["friends"], [
        ...currentFriends,
        {
          _id: data.recipient._id,
          fullName: data.recipient.fullName,
          profilePic: data.recipient.profilePic,
          nativeLanguage: data.recipient.nativeLanguage,
          learningLanguage: data.recipient.learningLanguage
        }
      ]);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-full p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img className="h-10 w-10 rounded-full" src={data.recipient.profilePic} alt="" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {data.recipient.fullName}
              </p>
              <p className="mt-1 text-sm">
                Accepted your friend request
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 3000 });
  }, [addAcceptedRequest, queryClient]);

  const handleUnfriended = useCallback((data) => {
    console.log('Unfriended notification received in SocketProvider:', data);
    try {
      if (!data || !data.userId) {
        console.error("Invalid unfriend data received:", data);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      const currentFriends = queryClient.getQueryData(["friends"]);
      if (currentFriends) {
        const updatedFriends = currentFriends.filter(friend => friend._id !== data.userId);
        queryClient.setQueryData(["friends"], updatedFriends);
      }
      const outgoingReqs = queryClient.getQueryData(["outgoingFriendReqs"]);
      if (outgoingReqs) {
        const updatedOutgoing = outgoingReqs.filter(req => req.recipient._id !== data.userId);
        queryClient.setQueryData(["outgoingFriendReqs"], updatedOutgoing);
      }
      if (data.user) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-full p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img className="h-10 w-10 rounded-full" src={data.user.profilePic} alt="" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Friend connection ended</p>
                  <p className="mt-1 text-sm">
                    {data.user.fullName} is no longer your friend
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 3000 });
      }
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["friends"] });
        queryClient.refetchQueries({ queryKey: ["outgoingFriendReqs"] });
        queryClient.refetchQueries({ queryKey: ["users"] });
      }, 300);
    } catch (error) {
      console.error("Error handling unfriend event:", error);
      queryClient.refetchQueries({ queryKey: ["friends"] });
      queryClient.refetchQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
    }
  }, [queryClient]);

  const handleFriendRequestCanceled = useCallback((data) => {
    console.log('Friend request canceled:', data);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-full p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img className="h-10 w-10 rounded-full" src={data.sender.profilePic} alt="" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {data.sender.fullName}
              </p>
              <p className="mt-1 text-sm">
                Canceled their friend request
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 3000 });
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
  }, [queryClient]);

  const handleGroupChatInvite = useCallback((data) => {
    console.log('Group chat invite received:', data);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-full p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img className="h-10 w-10 rounded-full" src={data.creator.profilePic} alt="" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {data.creator.fullName}
              </p>
              <p className="mt-1 text-sm">
                Added you to group "{data.groupName}"
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 4000 });
    queryClient.invalidateQueries({ queryKey: ["groupChats"] });
  }, [queryClient]);

  const handleAddedToGroup = useCallback((data) => {
    console.log('Added to group notification received:', data);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-base-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-full p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img className="h-10 w-10 rounded-full" src={data.addedBy.profilePic || '/default-avatar.png'} alt="" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {data.addedBy.fullName}
              </p>
              <p className="mt-1 text-sm">
                Added you to group "{data.groupName}"
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 4000 });
    queryClient.invalidateQueries({ queryKey: ["groupChats"] });
  }, [queryClient]);

  const handleKickedFromGroup = useCallback((data) => {
    const { groupName, kickedBy, timestamp } = data;
    toast.error(
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            {kickedBy.profilePic ? (
              <img src={kickedBy.profilePic} alt={kickedBy.fullName} />
            ) : (
              <div className="bg-error text-error-content flex items-center justify-center w-full h-full text-xs">
                {kickedBy.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="font-medium">You have been kicked from the group</p>
          <p className="text-sm opacity-75">{groupName} • {formatTimestamp(timestamp)}</p>
        </div>
      </div>,
      { duration: 5000 }
    );
    queryClient.invalidateQueries({ queryKey: ["groupChats"] });
  }, [queryClient]);

  // Single useEffect to handle all socket events
  useEffect(() => {
    if (!authUser?._id) return;

    // Connect socket if not already connected
    if (!socket.connected) {
      console.log("Socket connecting...");
      socket.connect();
    }

    // Register user to socket after connection
    socket.on('connect', handleConnect);
    
    // If already connected, emit register immediately
    if (socket.connected) {
      handleConnect();
    }

    console.log("SocketProvider: Registering socket event listeners");
    socket.on('friendRequest', handleFriendRequest);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('unfriended', handleUnfriended);
    socket.on('friendRequestCanceled', handleFriendRequestCanceled);
    socket.on('groupChatInvite', handleGroupChatInvite);
    socket.on('addedToGroup', handleAddedToGroup);
    socket.on('kickedFromGroup', handleKickedFromGroup);

    // Cleanup function
    return () => {
      console.log("SocketProvider: Removing socket event listeners");
      socket.off('connect', handleConnect);
      socket.off('friendRequest', handleFriendRequest);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('unfriended', handleUnfriended);
      socket.off('friendRequestCanceled', handleFriendRequestCanceled);
      socket.off('groupChatInvite', handleGroupChatInvite);
      socket.off('addedToGroup', handleAddedToGroup);
      socket.off('kickedFromGroup', handleKickedFromGroup);
    };
  }, [
    authUser,
    handleConnect,
    handleFriendRequest,
    handleFriendRequestAccepted,
    handleUnfriended,
    handleFriendRequestCanceled,
    handleGroupChatInvite,
    handleAddedToGroup,
    handleKickedFromGroup
  ]);

  return children;
}