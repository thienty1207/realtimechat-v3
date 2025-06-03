import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getChatToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChannelStateContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import GroupMembersModal from "../components/GroupMembersModal";
import { Users, Settings, UserPlus, LogOut, VideoIcon } from "lucide-react"; // Thêm VideoIcon

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Custom Group Header với nút video call tích hợp
const GroupChatHeader = ({ group, onShowMembers, onShowSettings, onVideoCall }) => {
  const { channel } = useChannelStateContext();
  const { authUser } = useAuthUser();
  
  const memberCount = channel?.data?.member_count || group?.members?.length || 0;
  const isAdmin = group?.admins?.some(admin => admin._id === authUser?._id);

  return (
    <div className="p-3 flex items-center justify-between border-b border-base-300">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
            {group?.avatar ? (
              <img src={group.avatar} alt={group.name} />
            ) : (
              <Users className="w-5 h-5" />
            )}
          </div>
        </div>
        
        <div>
          <div className="font-semibold text-base-content">
            {group?.name || "Chat Group"}
          </div>
          <div className="text-xs text-base-content/70">
            {memberCount} members
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Nút Video Call */}
        <button
          onClick={onVideoCall}
          className="btn btn-success btn-sm text-white"
          title="Start Video Call"
        >
          <VideoIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={onShowMembers}
          className="btn btn-ghost btn-sm"
          title="View Members"
        >
          <Users className="w-4 h-4" />
        </button>
        
        {isAdmin && (
          <button
            onClick={onShowSettings}
            className="btn btn-ghost btn-sm"
            title="Group Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const GroupChatPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const clientRef = useRef(null);

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { authUser } = useAuthUser();
  const groupFromState = location.state?.group;

  const { data: tokenData, refetch: refetchToken } = useQuery({
    queryKey: ["chatToken", authUser?._id],
    queryFn: getChatToken,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Hàm xử lý video call
  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `/call/${channel.id}`;
      const fullCallUrl = `${window.location.origin}${callUrl}`;

      // Gửi tin nhắn với link cuộc gọi
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${fullCallUrl}`,
      });
      
      // Mở cuộc gọi trong tab mới
      window.open(fullCallUrl, '_blank');
    }
  };

  const handleShowMembers = () => {
    setShowMembers(true);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  // Initialize group chat
  useEffect(() => {
    if (!authUser || !authUser._id || !tokenData || !tokenData.token || !channelId) {
      setLoading(true);
      return;
    }

    let isMounted = true;
    const client = new StreamChat(STREAM_API_KEY, {
      timeout: 10000,
      enableWSFallback: true,
      enableInsights: false,
    });
    clientRef.current = client;
  
    const initGroupChat = async () => {
      if (!isMounted) return;
      setErrorState(null);
      setLoading(true);
  
      try {
        console.log("Initializing group chat client...");
  
        const userToConnect = {
          id: authUser._id.toString(),
          name: authUser.fullName || "Anonymous",
          image: authUser.profilePic,
        };
  
        if (!client.userID || client.userID !== userToConnect.id) {
          await client.connectUser(userToConnect, tokenData.token);
          console.log("User connected to group chat successfully");
        } else {
          console.log("User already connected or connecting with the same ID.");
        }
        
        if (!isMounted) return;
  
        const groupChannel = client.channel("messaging", channelId);
        await groupChannel.watch();
        console.log("Group channel watch successful");
  
        if (!isMounted) return;
        setChatClient(client);
        setChannel(groupChannel);
        setErrorState(null);
  
      } catch (error) {
        console.error("Error initializing group chat:", error);
        if (!isMounted) return;
  
        if (error.message?.includes('user_details is a readonly field')) {
          toast.error("User details error with chat server. Retrying...");
        } else if (error.status === 404 || 
            error.message?.includes('does not exist') ||
            error.message?.includes('not found')) {
          toast.error("Chat group has been deleted or does not exist");
          navigate("/", { replace: true });
          return;
        } else if (error.message?.includes('disconnect') || 
            error.message?.includes('connection')) {
          toast.error("Chat connection error, redirecting to home...");
          navigate("/", { replace: true });
          return;
        }
        setErrorState("Unable to connect to chat group. Please try again.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    initGroupChat();
  
    return () => {
      isMounted = false;
      console.log("GroupChatPage unmounting, disconnecting client...");
      if (clientRef.current) {
        clientRef.current.disconnectUser()
          .then(() => console.log("Stream client disconnected successfully on unmount."))
          .catch(e => console.warn("Error disconnecting client on unmount:", e.message));
        clientRef.current = null;
      }
      setChatClient(null);
      setChannel(null);
    };
  }, [authUser, tokenData, channelId, navigate]);

  if (loading) {
    return <ChatLoader />;
  }

  if (errorState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-100">
        <div className="card w-full max-w-md bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error">Chat Group Connection Error</h2>
            <p>{errorState}</p>
            <div className="card-actions justify-end mt-4">
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chatClient && channel) {
    try {
      return (
        <div className="h-[93vh]">
          <Chat client={chatClient}>
            <Channel key={channel?.id} channel={channel}>
              <div className="w-full relative">
               
                <Window>
                  <GroupChatHeader 
                    group={groupFromState}
                    onShowMembers={handleShowMembers}
                    onShowSettings={handleShowSettings}
                    onVideoCall={handleVideoCall} 
                  />
                  <MessageList />
                  <MessageInput focus />
                </Window>
              </div>
              <Thread />
            </Channel>
          </Chat>
          
          {/* Group Members Modal */}
          <GroupMembersModal
            isOpen={showMembers}
            onClose={() => setShowMembers(false)}
            group={groupFromState}
            channelId={channelId}
          />
        </div>
      );
    } catch (error) {
      console.error("Stream Chat render error:", error);
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-base-100">
          <div className="card w-full max-w-md bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-error">Chat Display Error</h2>
              <p>The chat group may have been deleted or no longer exists.</p>
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/', { replace: true })}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return <ChatLoader />;
};

export default GroupChatPage;