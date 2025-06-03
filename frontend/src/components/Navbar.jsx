import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, MenuIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";
import { useNotificationStore } from "../store/useNotificationStore";

const Navbar = ({ showSidebar = false, onToggleMobileMenu, isMobileMenuOpen }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { hasNewNotifications } = useNotificationStore();

  // Get friend requests to show notification count
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Count of incoming friend requests
  const incomingRequestsCount = friendRequests?.incomingReqs?.length || 0;

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button - Only show when sidebar should be displayed */}
            {showSidebar && (
              <button 
                onClick={onToggleMobileMenu}
                className="btn btn-ghost btn-circle lg:hidden"
                aria-label="Toggle menu"
              >
                <MenuIcon className="size-6" />
              </button>
            )}
            
            {/* LOGO - Show in chat page or when no sidebar */}
            {(isChatPage || !showSidebar) && (
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                Broconnect
                </span>
              </Link>
            )}
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className={`h-6 w-6 text-base-content ${hasNewNotifications ? 'text-error' : 'opacity-70'}`} />
                {incomingRequestsCount > 0 && (
                  <div className="absolute -top-1 -right-1 size-5 rounded-full bg-error text-white text-xs flex items-center justify-center font-semibold">
                    {incomingRequestsCount}
                  </div>
                )}
                {hasNewNotifications && !incomingRequestsCount && (
                  <div className="absolute -top-1 -right-1 size-3 rounded-full bg-error"></div>
                )}
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            {/* Logout button */}
            <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
