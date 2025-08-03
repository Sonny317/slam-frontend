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

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    const imagePath = localStorage.getItem('profileImage');
    const role = localStorage.getItem('userRole');

    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
        role: role,
        memberships: [],
      };
    }
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] };
  });

  // ✅ 외부에서 사용자 정보를 강제로 새로고침하는 함수
  const refetchUser = async () => {
    if (localStorage.getItem('jwtToken')) { // 토큰이 있을 때만 실행
      try {
        const response = await axios.get("/api/users/me");
        const userData = response.data;
        setUser(prevUser => ({
          ...prevUser,
          isLoggedIn: true,
          email: userData.email,
          role: userData.role,
          profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
          memberships: userData.memberships || [],
        }));
      } catch (error) {
        console.error("Context에서 사용자 정보를 새로고침하는 데 실패했습니다:", error);
        logout(); // 실패 시 로그아웃 처리
      }
    }
  };

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

  const value = { user, login, logout, updateUserImage, refetchUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};