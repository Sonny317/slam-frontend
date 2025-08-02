import axios from 'axios';

const productionUrl = 'https://slam-backend.onrender.com';
const isProduction = process.env.NODE_ENV === 'production';

const instance = axios.create({
  baseURL: isProduction ? productionUrl : 'http://localhost:8080',
});

instance.interceptors.request.use(
  (config) => {
    // ✅ localStorage -> sessionStorage 로 변경
    const token = sessionStorage.getItem('jwtToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;