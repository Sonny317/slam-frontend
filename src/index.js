import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import axios from './api/axios'; // ⬅️ 이 줄을 삭제합니다.

// --- ⬇️ 이전에 추가했던 인증 토큰 설정 로직 전체를 삭제합니다. ⬇️ ---
// const token = localStorage.getItem('jwtToken');
// if (token) {
//   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// }
// --- ⬆️ 여기까지 삭제 ⬆️ ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();