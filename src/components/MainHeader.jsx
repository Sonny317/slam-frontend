import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import NotificationBell from './NotificationBell';

export default function MainHeader() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useUser();
  const defaultProfileImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%23e5e7eb'/><circle cx='12' cy='9' r='4' fill='%239ca3af'/><path d='M4 20c0-4 4-6 8-6s8 2 8 6' fill='%239ca3af'/></svg>";

  // 화면 크기 변경 감지하여 모바일 메뉴 상태 초기화
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      if (!isMobileView) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 마운트 시에도 한 번 체크
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 외부 클릭 시 메뉴들 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
      if (showNotificationDropdown && !event.target.closest('.notification-container')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotificationDropdown]);

  const handleMyPage = () => {
    setShowProfileMenu(false);
    setShowNotificationDropdown(false);
    setIsMobileMenuOpen(false);
    navigate("/mypage");
  };

  const handleAdminPage = () => {
    setShowProfileMenu(false);
    setShowNotificationDropdown(false);
    setIsMobileMenuOpen(false);
    navigate("/admin/dashboard");
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    setShowNotificationDropdown(false);
    setIsMobileMenuOpen(false);
    logout();
  }

  const handleProfileMenuToggle = () => {
    const newState = !showProfileMenu;
    setShowProfileMenu(newState);
    if (newState) {
      setShowNotificationDropdown(false); // 프로필 메뉴 열면 알림 드롭다운 닫기
    }
  };

  const handleNotificationToggle = (isOpen) => {
    setShowNotificationDropdown(isOpen);
    if (isOpen) {
      setShowProfileMenu(false); // 알림 드롭다운 열면 프로필 메뉴 닫기
    }
  };

  const handleNotificationClose = () => {
    setShowNotificationDropdown(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotificationDropdown(false);
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow bg-white relative z-50">
      <Link to="/" className="flex items-center gap-2">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-8 h-8 rounded-full object-cover" />
        <span className="text-lg font-semibold">SLAM</span>
      </Link>

      {/* --- Desktop Menu --- */}
      {!isMobile && (
        <nav className="flex items-center gap-6 text-sm font-medium">
        <Link to="/about-us">About Us</Link>
        <Link to="/community">Community</Link>
        <Link to="/events">Events</Link>
        <Link to="/partnership">Partners</Link>

        {!user.isLoggedIn ? (
          <>
            <Link to="/signup" className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">Sign Up</Link>
            <Link to="/login" className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-100">Log In</Link>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="notification-container">
              <NotificationBell 
                isOpen={showNotificationDropdown}
                onToggle={handleNotificationToggle}
                onClose={handleNotificationClose}
              />
            </div>
            <div className="relative z-50 profile-menu-container">
              <img
                src={user.profileImage || defaultProfileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
                onClick={handleProfileMenuToggle}
                onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileImage; }}
              />
            {showProfileMenu && (
              <div 
                className="fixed right-6 top-16 w-48 bg-white rounded-md shadow-xl py-1 border border-gray-200"
                style={{ zIndex: 99999 }}
              >
                <button onClick={handleMyPage} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Page
                </button>
                
                {user.role === 'ADMIN' && (
                  <button onClick={handleAdminPage} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Admin Page
                  </button>
                )}

                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        )}
      </nav>
      )}

      {/* --- Mobile Menu Button --- */}
      {isMobile && (
        <div className="flex items-center space-x-2">
          {user.isLoggedIn && (
            <div className="notification-container">
              <NotificationBell 
                isOpen={showNotificationDropdown}
                onToggle={handleNotificationToggle}
                onClose={handleNotificationClose}
              />
            </div>
          )}
          <button onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            setShowProfileMenu(false);
            setShowNotificationDropdown(false);
          }}>
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* --- Mobile Menu Panel --- */}
      {isMobile && isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md">
          <nav className="flex flex-col items-center gap-4 py-4">
            <Link to="/about-us" onClick={closeMobileMenu}>About Us</Link>
            <Link to="/community" onClick={closeMobileMenu}>Community</Link>
            <Link to="/events" onClick={closeMobileMenu}>Events</Link>
            <Link to="/partnership" onClick={closeMobileMenu}>Partners</Link>

            <hr className="w-11/12" />

            {!user.isLoggedIn ? (
              <>
                <Link to="/signup" onClick={closeMobileMenu} className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 w-11/12 text-center">Sign Up</Link>
                <Link to="/login" onClick={closeMobileMenu} className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 w-11/12 text-center">Log In</Link>
              </>
            ) : (
              <>
                 <button onClick={handleMyPage} className="w-full text-center py-2">My Page</button>
                {user.role === 'ADMIN' && (
                  <button onClick={handleAdminPage} className="w-full text-center py-2">Admin Page</button>
                )}
                <button onClick={handleLogout} className="w-full text-center py-2 text-red-500">Log out</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}