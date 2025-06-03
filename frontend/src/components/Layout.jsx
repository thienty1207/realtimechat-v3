import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Desktop Sidebar */}
        {showSidebar && <Sidebar />}
        
        {/* Mobile Sidebar Overlay */}
        {showSidebar && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            {/* Mobile Sidebar */}
            <div className="fixed left-0 top-0 z-50 lg:hidden">
              <Sidebar isMobile={true} onClose={closeMobileMenu} />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col">
          <Navbar 
            showSidebar={showSidebar} 
            onToggleMobileMenu={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
