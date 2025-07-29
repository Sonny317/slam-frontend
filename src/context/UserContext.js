import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin } from '../api/auth';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // ✅ axios.js와 동일한 로직으로 백엔드 주소를 설정합니다.
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? "https://slam-backend.onrender.com" 
    : "http://localhost:8080";
    
  const defaultProfileImage = "/default_profile.jpg";

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    const imagePath = localStorage.getItem('profileImage');

    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
      };
    }
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage };
  });

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
      });
      return userData;
    } catch (error) {
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage });
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