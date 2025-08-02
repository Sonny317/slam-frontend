import React, { createContext, useState, useContext } from 'react';
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
    const role = localStorage.getItem('userRole'); // ✅ 1. localStorage에서 role을 읽어옵니다.

    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
        role: role, // ✅ 2. 초기 user 상태에 role을 포함시킵니다.
      };
    }
    // 로그아웃 상태일 때의 기본값
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null };
  });

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role, // ✅ 3. 로그인 성공 시 API 응답에서 받은 role로 상태를 업데이트합니다.
      });
      return userData;
    } catch (error) {
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("userRole"); // ✅ 로그아웃 시 role도 삭제
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null });
    window.location.href = '/';
  };
  
  const updateUserImage = (newImagePath) => {
      if(user.isLoggedIn && newImagePath) {
          setUser(prevUser => ({ ...prevUser, profileImage: `${backendUrl}${newImagePath}`}));
      }
  }

  const value = { user, login, logout, updateUserImage };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};