import { useQuery } from "@tanstack/react-query";
import { getUserGroupChats } from "../lib/api";
import { Link } from "react-router";
import { Users, MessageCircle, Crown } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const GroupChatList = () => {
  const { authUser } = useAuthUser();
  
  const { data: groupChats = [], isLoading } = useQuery({
    queryKey: ["groupChats"],
    queryFn: getUserGroupChats
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
              <div className="w-12 h-12 bg-base-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-base-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupChats.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto text-base-content/50 mb-3" />
        <h3 className="font-semibold text-lg mb-2">No group chats yet</h3>
        <p className="text-base-content/70">
          Create your first group chat to start conversations with multiple friends at once!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupChats.map((group) => {
        const isCreator = group.creator._id === authUser?._id;
        const isAdmin = group.admins.some(admin => admin._id === authUser?._id);
        
        return (
          <Link
            key={group._id}
            to={`/group-chat/${group.streamChannelId}`}
            state={{ group }}
            className="block hover:bg-base-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {group.avatar ? (
                    <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{group.name}</h3>
                  {isCreator && <Crown className="w-4 h-4 text-yellow-500" />}
                  {isAdmin && !isCreator && <span className="badge badge-primary badge-xs">Admin</span>}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <Users className="w-3 h-3" />
                  <span>{group.members.length} members</span>
                  {group.description && (
                    <>
                      <span>•</span>
                      <span className="truncate">{group.description}</span>
                    </>
                  )}
                </div>
              </div>
              
              <MessageCircle className="w-5 h-5 text-base-content/50" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default GroupChatList;