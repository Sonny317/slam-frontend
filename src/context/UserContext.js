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
    // ✅ localStorage -> sessionStorage 로 변경
    const token = sessionStorage.getItem('jwtToken');
    const email = sessionStorage.getItem('userEmail');
    const imagePath = sessionStorage.getItem('profileImage');
    const role = sessionStorage.getItem('userRole');

    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
        role: role,
      };
    }
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null };
  });

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role,
      });
      return userData;
    } catch (error) {
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null });
      throw error;
    }
  };

  const logout = () => {
    // ✅ localStorage -> sessionStorage 로 변경 (clear()로 한번에 삭제)
    sessionStorage.clear();
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null });
    window.location.href = '/';
  };
  
  const updateUserImage = (newImagePath) => {
      if(user.isLoggedIn && newImagePath) {
          // ✅ localStorage -> sessionStorage 로 변경
          sessionStorage.setItem("profileImage", newImagePath);
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