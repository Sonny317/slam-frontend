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

  const [loading, setLoading] = useState(true);

  // ✅ 2. 그 후, 서버에 접속해서 localStorage 정보가 최신인지 다시 한번 확인하고 업데이트합니다.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (user.isLoggedIn) {
        try {
          const response = await axios.get("/api/users/me");
          const userData = response.data;
          
          // 받아온 최신 정보로 user 상태를 다시 한번 동기화합니다.
          setUser(prevUser => ({
            ...prevUser,
            email: userData.email,
            role: userData.role,
            profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : prevUser.profileImage,
            memberships: userData.memberships || [],
          }));
        } catch (error) {
          console.error("Failed to fetch user on load, logging out.", error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [user.isLoggedIn]);

  const login = async (email, password) => {
    const userData = await apiLogin(email, password);
    setUser({
      isLoggedIn: true,
      email: userData.email,
      profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
      role: userData.role,
      memberships: userData.memberships || [],
    });
    return userData;
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

  if (loading && user.isLoggedIn) {
    return null; // 또는 로딩 스피너
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};