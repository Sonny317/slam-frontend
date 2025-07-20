import axios from 'axios';

// 1. axios 인스턴스를 생성합니다.
const instance = axios.create({
  baseURL: 'http://localhost:8080',
});

// 2. 요청 감시병(Request Interceptor) 설정
//    모든 API 요청이 서버로 전송되기 전에 이 코드가 먼저 실행됩니다.
instance.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옵니다.
    const token = localStorage.getItem('jwtToken');
    
    // 토큰이 존재하면, 요청 헤더에 'Authorization'을 추가합니다.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

export default instance;