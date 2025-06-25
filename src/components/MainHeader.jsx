import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MainHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // ✅ 기본 이미지와 백엔드 주소 설정
  const backendUrl = "http://localhost:8080";
  const defaultProfileImage = "/default_profile.jpg";
  const [profileImage, setProfileImage] = useState(defaultProfileImage);

  const isLoggedIn = !!localStorage.getItem("jwtToken");

  // ✅ 프로필 이미지 업데이트 로직 수정
  useEffect(() => {
    // 이미지 상태를 업데이트하는 함수
    const updateProfileImage = () => {
      if (isLoggedIn) {
        const storedImage = localStorage.getItem("profileImage");
        // 저장된 이미지가 있으면 전체 URL을, 없으면 기본 이미지를 사용
        setProfileImage(storedImage ? `${backendUrl}${storedImage}` : defaultProfileImage);
      } else {
        setProfileImage(defaultProfileImage);
      }
    };

    // 1. 페이지가 처음 로드될 때 이미지 업데이트
    updateProfileImage();

    // 2. MyPage에서 보낸 'profileImageChanged' 이벤트를 감지하여 이미지 업데이트
    window.addEventListener("profileImageChanged", updateProfileImage);

    // 3. 컴포넌트가 사라질 때 이벤트 리스너 정리 (메모리 누수 방지)
    return () => {
      window.removeEventListener("profileImageChanged", updateProfileImage);
    };
  }, [isLoggedIn]); // 로그인 상태가 바뀔 때도 이 로직이 다시 실행됩니다.

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    // 로그아웃 시 기본 이미지로 변경
    setProfileImage(defaultProfileImage); 
    navigate("/");
    window.location.reload(); // 상태 반영을 위해 새로고침
  };

  const handleMyPage = () => {
    setShowMenu(false);
    navigate("/mypage");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow bg-white relative">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="/slam_logo_web_rgb.jpg"
          alt="SLAM Logo"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-lg font-semibold">SLAM</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link to="/">Home</Link>
        <Link to="/">Community</Link>
        <Link to="/events/pilot">Events</Link>

        {!isLoggedIn ? (
          <>
            <Link to="/signup" className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">
              Sign Up
            </Link>
            <Link to="/login" className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-100">
              Log In
            </Link>
          </>
        ) : (
          <div className="relative">
            <img
              src={profileImage}
              alt="프로필"
              className="w-8 h-8 rounded-full cursor-pointer object-cover"
              onClick={() => setShowMenu(!showMenu)}
              // ✅ 이미지 로딩 실패 시 기본 이미지 표시
              onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileImage; }}
            />
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                <button onClick={handleMyPage} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                  마이페이지
                </button>
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
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