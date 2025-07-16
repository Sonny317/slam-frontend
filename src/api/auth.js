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

// ✅ 이 함수를 파일에 추가해주세요.
export const sendVerificationCode = async (email) => {
  try {
    // 이 주소는 친구(백엔드)가 만들어준 API 경로입니다.
    const response = await axios.post("/auth/send-verification-code", { email });
    return response.data;
  } catch (error) {
    // 에러를 던져서 호출한 쪽에서 처리할 수 있게 합니다.
    throw error.response?.data || error;
  }
};