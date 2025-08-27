import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from '../api/axios';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError('Google 로그인 중 오류가 발생했습니다.');
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('인증 코드를 받지 못했습니다.');
          setIsProcessing(false);
          return;
        }

        // 백엔드로 인증 코드 전송
        const response = await axios.post('/api/auth/google/callback', { code });
        
        if (response.data && response.data.token) {
          // JWT 토큰을 저장하고 로그인 처리
          localStorage.setItem('jwtToken', response.data.token);
          await login(response.data.email, response.data.token);
          navigate('/');
        } else {
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setError('Google 로그인 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Google 로그인 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">로그인 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
