import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const { token, profileImage, name, role } = response.data;

    // ✅ sessionStorage -> localStorage 로 변경
    localStorage.setItem("userEmail", email);
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    
    return response.data;
  } catch (error) {
    // 에러 발생 시 모든 정보 삭제
    localStorage.clear();
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

export const checkEmail = async (email) => {
  try {
    const response = await axios.get('/api/auth/check-email', { params: { email } });
    return response.data; // { available: boolean }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resolveAuthorsBatch = async (authors) => {
  try {
    const response = await axios.post('/api/users/resolve-batch', { authors });
    return response.data; // { [author]: { found, userId, name, email, profileImage } }
  } catch (error) {
    throw error.response?.data || error;
  }
};