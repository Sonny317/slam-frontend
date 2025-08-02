import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const { token, profileImage, name, role } = response.data;

    // ✅ localStorage -> sessionStorage 로 변경
    sessionStorage.setItem("userEmail", email);
    sessionStorage.setItem("jwtToken", token);
    sessionStorage.setItem("userName", name);
    sessionStorage.setItem("userRole", role);
    
    if (profileImage) {
      sessionStorage.setItem("profileImage", profileImage);
    }
    
    return response.data;
  } catch (error) {
    // 에러 발생 시 모든 정보 삭제
    sessionStorage.clear();
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