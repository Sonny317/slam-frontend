import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MainHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [profileImage, setProfileImage] = useState("/default_profile.jpg");

  const isLoggedIn = !!localStorage.getItem("jwtToken");

  useEffect(() => {
    if (isLoggedIn) {
      const storedImage = localStorage.getItem("profileImage");
      if (storedImage) {
        setProfileImage(storedImage);
      }
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    navigate("/");
  };

  const handleMyPage = () => {
    setShowMenu(false);
    navigate("/mypage");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow bg-white relative">
      <div className="flex items-center gap-2">
        <img
          src="/slam_logo_web_rgb.jpg"
          alt="SLAM Logo"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-lg font-semibold">SLAM</span>
      </div>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link to="/">Home</Link>
        <a href="#">Community</a>
        <a href="#">Events</a>

        {!isLoggedIn ? (
          <>
            <Link
              to="/signup"
              className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              Log In
            </Link>
          </>
        ) : (
          <div className="relative">
            <img
              src={profileImage}
              alt="프로필"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                <button
                  onClick={handleMyPage}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  마이페이지
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
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
