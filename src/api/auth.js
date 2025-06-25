import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    // ✅ 백엔드에서 전달해주는 데이터 전체를 받습니다.
    const { token, profileImage } = response.data;

    // localStorage에 필요한 모든 정보를 저장합니다.
    localStorage.setItem("userEmail", email);
    localStorage.setItem("jwtToken", token);
    
    // ✅ 프로필 이미지가 있는 경우에만 localStorage에 저장합니다.
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }

    // 모든 axios 요청에 인증 헤더를 기본으로 설정합니다.
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// register 함수는 기존과 동일합니다.
export const register = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "회원가입 실패";
  }
};