import axios from './axios';

// 기존 로그인 함수 유지
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

// ✅ 회원가입 함수 추가
export const register = async (email, password, code, role = "USER") => {
  try {
    const response = await axios.post("/auth/register", {
      email,
      password,
      code,    // ✅ 인증코드 추가
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "회원가입 실패";
  }
};

