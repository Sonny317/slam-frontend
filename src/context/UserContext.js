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
    // ✅ sessionStorage -> localStorage 로 변경
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
    // ✅ sessionStorage -> localStorage 로 변경
    localStorage.clear();
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null });
    window.location.href = '/';
  };
  
  const updateUserImage = (newImagePath) => {
      if(user.isLoggedIn && newImagePath) {
          // ✅ sessionStorage -> localStorage 로 변경
          localStorage.setItem("profileImage", newImagePath);
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