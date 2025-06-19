import axios from './axios';

// 기존 로그인 함수는 변경사항 없이 그대로 유지합니다.
export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const token = response.data.token;
    localStorage.setItem('jwtToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ 회원가입 함수 수정
// 상세 정보가 포함된 userData 객체를 인자로 받아 백엔드에 전달합니다.
export const register = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    // 백엔드에서 오는 구체적인 에러 메시지가 있다면 그것을 사용하고, 없다면 기본 메시지를 사용합니다.
    throw error.response?.data || error.message || "회원가입 실패";
  }
};