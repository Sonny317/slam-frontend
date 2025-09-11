import axios from 'axios';

const productionUrl = 'https://slam-backend.onrender.com';
const isProduction = process.env.NODE_ENV === 'production';

const instance = axios.create({
  baseURL: isProduction ? productionUrl : 'http://localhost:8080',
});

instance.interceptors.request.use(
  (config) => {
    // ✅ sessionStorage -> localStorage 로 변경
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ 새로운 응답 인터셉터 추가 - 토큰 만료 처리
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러(인증 실패) 발생 시 자동 로그아웃
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, logging out...');
      localStorage.clear();
      // 로그인 페이지로 리다이렉트하지 않고 페이지 새로고침
      // 이렇게 하면 UserContext가 localStorage를 확인하여 로그아웃 상태로 업데이트됩니다
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default instance;