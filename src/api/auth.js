import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const token = response.data.token;
    
    // ✅ 이메일을 localStorage에 저장하는 코드를 추가합니다.
    localStorage.setItem("userEmail", email); 
    localStorage.setItem("jwtToken", token);
    
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