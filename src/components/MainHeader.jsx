import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';

export default function MainHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useUser();
  const defaultProfileImage = "/default_profile.jpg";

  const handleMyPage = () => {
    setShowMenu(false);
    navigate("/mypage");
  };

  // ✅ 추가: 관리자 페이지로 이동하는 함수
  const handleAdminPage = () => {
    setShowMenu(false);
    navigate("/admin/dashboard"); // 관리자 페이지의 첫 화면으로 이동
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow bg-white relative">
      <Link to="/" className="flex items-center gap-2">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-8 h-8 rounded-full object-cover" />
        <span className="text-lg font-semibold">SLAM</span>
      </Link>
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
          <div className="relative">
            <img
              src={user.profileImage}
              alt="프로필"
              className="w-8 h-8 rounded-full cursor-pointer object-cover"
              onClick={() => setShowMenu(!showMenu)}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileImage; }}
            />
            {showMenu && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button onClick={handleMyPage} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  마이페이지
                </button>
                
                {/* ✅ user.role이 'ADMIN'일 때만 이 버튼이 보입니다. */}
                {user.role === 'ADMIN' && (
                  <button onClick={handleAdminPage} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Admin Page
                  </button>
                )}

                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}