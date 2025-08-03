import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { login as apiLogin } from '../api/auth';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? "https://slam-backend.onrender.com" 
    : "http://localhost:8080";
    
  const defaultProfileImage = "/default_profile.jpg";

  // ✅ 이제 user 상태의 초기값은 로그인 여부만 간단히 확인합니다.
  const [user, setUser] = useState({
    isLoggedIn: !!localStorage.getItem('jwtToken'),
    email: null,
    profileImage: defaultProfileImage,
    role: null,
    memberships: [],
  });
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가

  // ✅ 앱이 처음 로드될 때 실행되는 가장 중요한 로직
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // localStorage에 토큰이 있는지 확인
      const token = localStorage.getItem('jwtToken');
      if (token) {
        try {
          // 서버에 내 정보를 요청하여 최신 데이터를 가져옵니다.
          const response = await axios.get("/api/users/me");
          const userData = response.data;
          
          // 받아온 최신 정보로 user 상태를 완벽하게 설정합니다.
          setUser({
            isLoggedIn: true,
            email: userData.email,
            role: userData.role,
            profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
            memberships: userData.memberships || [],
          });
        } catch (error) {
          // 토큰이 유효하지 않은 경우 등 에러 발생 시 로그아웃 처리
          console.error("Failed to fetch user on load, logging out.", error);
          logout();
        }
      }
      setLoading(false); // 정보 로딩 완료
    };

    fetchCurrentUser();
  }, []); // 이 useEffect는 앱이 시작될 때 단 한 번만 실행됩니다.

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role,
        memberships: userData.memberships || [],
      });
      return userData;
    } catch (error) {
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] });
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] });
    window.location.href = '/';
  };
  
  const updateUserImage = (newImagePath) => {
      if(user.isLoggedIn && newImagePath) {
          localStorage.setItem("profileImage", newImagePath);
          setUser(prevUser => ({ ...prevUser, profileImage: `${backendUrl}${newImagePath}`}));
      }
  }

  const value = { user, login, logout, updateUserImage, loading };

  // 로딩 중일 때는 아무것도 표시하지 않아 깜빡임을 방지할 수 있습니다.
  if (loading) {
    return null; // 또는 로딩 스피너 컴포넌트를 보여줄 수 있습니다.
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};