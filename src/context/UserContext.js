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

  // ✅ 1. 앱이 시작될 때 localStorage에서 모든 정보를 즉시 읽어와 초기 상태를 완벽하게 설정합니다.
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    const imagePath = localStorage.getItem('profileImage');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        name: name || '',
        bio: '',
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
        role: role,
        memberships: [],
      };
    }
    return { isLoggedIn: false, email: null, name: '', bio: '', profileImage: defaultProfileImage, role: null, memberships: [] };
  });

  const [loading, setLoading] = useState(true);

  // ✅ 2. 그 후, 서버에 접속해서 localStorage 정보가 최신인지 다시 한번 확인하고 업데이트합니다.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // 로그인 상태일 때만 서버에 최신 정보를 요청합니다.
      if (user.isLoggedIn) {
        try {
          const response = await axios.get("/api/users/me");
          const userData = response.data;
          
          // 받아온 최신 정보로 user 상태를 다시 한번 동기화합니다.
          setUser(prevUser => ({
            ...prevUser, // 기존 email, isLoggedIn 등은 유지
            name: userData.name || prevUser.name,
            bio: userData.bio || prevUser.bio,
            role: userData.role || prevUser.role, // 서버의 최신 role이 있으면 사용, 없으면 기존 role 유지
            profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : prevUser.profileImage,
            memberships: userData.memberships || [],
          }));
        } catch (error) {
          console.error("Failed to fetch user on load, logging out.", error);
          logout(); // 토큰이 유효하지 않으면 로그아웃 처리
        }
      }
      setLoading(false); // 정보 로딩(또는 확인) 완료
    };

    fetchCurrentUser();
  }, [user.isLoggedIn]); // 로그인 상태가 바뀔 때(로그인 성공 시) 이 로직이 실행됩니다.

  const login = async (email, password) => {
    // Google OAuth 사용자의 경우 password가 JWT 토큰일 수 있음
    if (password && password.startsWith('eyJ')) {
      // JWT 토큰인 경우 (Google OAuth)
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');
      const profileImage = localStorage.getItem('profileImage');
      
      setUser({
        isLoggedIn: true,
        email: email,
        name: name || '',
        bio: '',
        profileImage: profileImage ? `${backendUrl}${profileImage}` : defaultProfileImage,
        role: role,
        memberships: [],
      });
      return { email, name, role };
    } else {
      // 일반 로그인의 경우
      const userData = await apiLogin(email, password); // auth.js에서 localStorage에 저장
      // 로그인 성공 후, localStorage에서 다시 읽어와 상태를 설정하여 일관성을 유지합니다.
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');
      setUser({
        isLoggedIn: true,
        email: userData.email,
        name: name || userData.name || '',
        bio: userData.bio || '',
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: role,
        memberships: userData.memberships || [],
      });
      return userData;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser({ isLoggedIn: false, email: null, name: '', bio: '', profileImage: defaultProfileImage, role: null, memberships: [] });
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
  if (loading && user.isLoggedIn) {
    return null;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};