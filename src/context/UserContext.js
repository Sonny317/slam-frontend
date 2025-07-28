import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { login as apiLogin } from '../api/auth';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const backendUrl = "http://localhost:8080";
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
        memberships: [], // ✅ 멤버십 목록을 위한 초기값 추가
      };
    }
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] };
  });

  // ✅ 로그인 상태가 되면, 사용자의 상세 정보를 불러와 멤버십을 업데이트합니다.
  useEffect(() => {
    const fetchUserMemberships = async () => {
      if (user.isLoggedIn) {
        try {
          const response = await axios.get("/api/users/me");
          setUser(prevUser => ({
            ...prevUser,
            memberships: response.data.memberships || [], // API 응답에서 멤버십 목록을 가져옵니다.
          }));
        } catch (error) {
          console.error("Context에서 사용자 멤버십 정보를 불러오는 데 실패했습니다:", error);
        }
      }
    };
    fetchUserMemberships();
  }, [user.isLoggedIn]); // isLoggedIn 상태가 바뀔 때마다 실행됩니다.

  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password);
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role,
        memberships: [], // 로그 직후에는 비어있다가, 위의 useEffect가 채워줍니다.
      });
      return userData;
    } catch (error) {
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("userRole");
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage, role: null, memberships: [] });
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