import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin } from '../api/auth';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const backendUrl = "http://localhost:8080";
  const defaultProfileImage = "/default_profile.jpg";

  // ✅ 사용자 정보를 하나의 'user' 객체로 관리하여 동기화 문제를 원천 차단합니다.
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    const imagePath = localStorage.getItem('profileImage');
    const role = localStorage.getItem('userRole'); // ✅ role 정보 읽기

    // 앱이 처음 로드될 때 localStorage를 기반으로 초기 상태를 완벽하게 설정합니다.
    if (token && email) {
      return {
        isLoggedIn: true,
        email: email,
        profileImage: imagePath ? `${backendUrl}${imagePath}` : defaultProfileImage,
        role: role, // ✅ 초기 상태에 role 포함
      };
    }
    return { isLoggedIn: false, email: null, profileImage: defaultProfileImage };
  });

  // 로그인 함수: Context가 직접 API를 호출하고 상태를 한 번에 업데이트합니다.
  const login = async (email, password) => {
    try {
      const userData = await apiLogin(email, password); // 기존 auth.js의 login 함수 호출
      
      // 로그인 성공 시, 새로운 user 객체로 상태를 원자적으로 업데이트합니다.
      setUser({
        isLoggedIn: true,
        email: userData.email,
        profileImage: userData.profileImage ? `${backendUrl}${userData.profileImage}` : defaultProfileImage,
        role: userData.role, // ✅ 로그인 시 role 상태 업데이트
      });

      return userData; // 성공 시 사용자 데이터 반환
    } catch (error) {
      // 실패 시 상태를 확실하게 로그아웃 상태로 만듭니다.
      setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    // 로그아웃 시에도 user 객체를 한 번에 업데이트합니다.
    setUser({ isLoggedIn: false, email: null, profileImage: defaultProfileImage });
    window.location.href = '/'; // 로그아웃 후에는 홈으로 이동
  };
  
  // MyPage에서 프로필 이미지 변경 시 호출될 함수
  const updateUserImage = (newImagePath) => {
      if(user.isLoggedIn && newImagePath) {
          // 기존 사용자 정보는 유지하면서 프로필 이미지만 업데이트합니다.
          setUser(prevUser => ({ ...prevUser, profileImage: `${backendUrl}${newImagePath}`}));
      }
  }

  // Context를 통해 제공될 값들
  const value = { user, login, logout, updateUserImage };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};