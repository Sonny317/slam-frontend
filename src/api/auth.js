import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const { token, profileImage, name, role } = response.data; // ✅ role 정보 추출
    localStorage.setItem("userEmail", email);
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userName", name); // ✅ 이름도 저장해두면 편리합니다.
    localStorage.setItem("userRole", role); // ✅ role 정보 저장
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    
    // ✅ 여기서 axios 헤더를 직접 설정하는 코드를 삭제합니다.
    // Interceptor가 이 역할을 대신합니다.

    return response.data; // 로그인 성공 데이터를 반환합니다.
  } catch (error) {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "회원가입 실패";
  }
};

export const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post("/auth/send-verification-code", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};