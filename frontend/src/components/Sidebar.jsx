import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, CodeIcon, XIcon, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const Sidebar = ({ isMobile = false, onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  // Get friend requests to show notification count
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Count of incoming friend requests
  const incomingRequestsCount = friendRequests?.incomingReqs?.length || 0;

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`w-64 bg-base-200 border-r border-base-300 flex-col h-screen sticky top-0 ${
      isMobile ? 'flex' : 'hidden lg:flex'
    }`}>
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <span className="text-lg font-semibold">Menu</span>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      )}
      
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5" onClick={handleLinkClick}>
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
          Broconnect
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
          onClick={handleLinkClick}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/group-chats"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/group-chats" ? "btn-active" : ""
          }`}
          onClick={handleLinkClick}
        >
          <Users className="size-5 text-base-content opacity-70" />
          <span>Group Chats</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className="relative">
            <BellIcon className="size-5 text-base-content opacity-70" />
            {incomingRequestsCount > 0 && (
              <div className="absolute -top-2 -right-2 size-4 rounded-full bg-error text-white text-xs flex items-center justify-center font-semibold">
                {incomingRequestsCount}
              </div>
            )}
          </div>
          <span>Notifications</span>
        </Link>

        <Link
          to="/code-playground"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/code-playground" ? "btn-active" : ""
          }`}
          onClick={handleLinkClick}
        >
          <CodeIcon className="size-5 text-base-content opacity-70" />
          <span>Code Playground</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
