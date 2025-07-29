import axios from 'axios';

// 1. 실제 배포된 백엔드 서버의 주소를 여기에 적습니다.
//    (Render 대시보드에서 확인한 주소)
const productionUrl = 'https://slam-backend.onrender.com'; 

// 2. 현재 환경이 'production'(배포)인지 확인합니다.
//    'npm run build'를 실행하면 이 값은 자동으로 'production'이 됩니다.
const isProduction = process.env.NODE_ENV === 'production';

// 3. 환경에 따라 다른 baseURL을 설정합니다.
const instance = axios.create({
  baseURL: isProduction ? productionUrl : 'http://localhost:8080',
});

// 4. 모든 요청을 가로채서 토큰을 추가하는 부분은 그대로 유지합니다.
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