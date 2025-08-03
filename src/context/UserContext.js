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

  // ✅ 사용자 정보를 서버로부터 다시 불러오는 함수
  const refetchUser = async () => {
    if (user.isLoggedIn) {
      try {
        const response = await axios.get("/api/users/me");
        setUser(prevUser => ({
          ...prevUser,
          memberships: response.data.memberships || [],
        }));
      } catch (error) {
        console.error("Context에서 사용자 정보를 새로고침하는 데 실패했습니다:", error);
      }
    }
  };

  useEffect(() => {
    refetchUser(); // 로그인 상태가 변경될 때마다 실행
  }, [user.isLoggedIn]);

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role,
        memberships: [],
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

  // ✅ refetchUser 함수를 value에 추가
  const value = { user, login, logout, updateUserImage, refetchUser };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};