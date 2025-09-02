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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    eventPhotoAgreed: false,
  });

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
        console.log('Sending code to backend:', code);
        const response = await axios.post('/api/auth/google/callback', { code });
        
        console.log('Google callback response:', response.data);
        
        if (response.data && response.data.isNewUser) {
          // 신규 사용자인 경우 약관 동의 모달 표시
          console.log('New user detected, showing terms agreement modal');
          setGoogleUserData(response.data.userData);
          setShowTermsModal(true);
          setIsProcessing(false);
        } else if (response.data && response.data.token) {
          // 기존 사용자인 경우 바로 로그인 처리
          localStorage.setItem('jwtToken', response.data.token);
          
          // Google OAuth 사용자 정보를 localStorage에 저장
          localStorage.setItem('userEmail', response.data.email);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('userRole', response.data.role);
          localStorage.setItem('profileImage', response.data.profileImage || '');
          
          // UserContext의 login 함수를 사용하여 상태 업데이트
          await login(response.data.email, response.data.token);
          
          // 메인 페이지로 이동
          navigate('/');
        } else {
          console.error('No token in response:', response.data);
          setError('로그인 처리 중 오류가 발생했습니다. 토큰을 받지 못했습니다.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setError('Google 로그인 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  // 약관 동의 처리 함수
  const handleTermsAgreement = async () => {
    if (!formData.termsOfServiceAgreed || !formData.privacyPolicyAgreed || !formData.eventPhotoAgreed) {
      alert("Please agree to all required terms.");
      return;
    }

    try {
      // 회원가입 API 호출
      const registerData = {
        name: googleUserData.name,
        email: googleUserData.email,
        password: "", // Google OAuth 사용자는 비밀번호 없음
        termsOfServiceAgreed: formData.termsOfServiceAgreed,
        privacyPolicyAgreed: formData.privacyPolicyAgreed,
        eventPhotoAgreed: formData.eventPhotoAgreed,
        isGoogleUser: true,
        googleId: googleUserData.providerId
      };

      console.log("Sending register data:", registerData);

      const registerResponse = await axios.post('/auth/register', registerData);
      
      // 회원가입 성공 후 바로 로그인 처리
      if (registerResponse.data && registerResponse.data.token) {
        await login(googleUserData.email, registerResponse.data.token);
        alert("Registration and login successful!");
        setShowTermsModal(false);
        navigate("/");
      } else {
        alert("Registration successful! Please log in manually.");
        setShowTermsModal(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + (error.response?.data || error.message));
    }
  };

  // 약관 동의 모달 컴포넌트
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Terms Agreement Required</h2>
            <button 
              onClick={() => setShowTermsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-sm text-gray-700 mb-6">
            <p className="text-red-600 font-medium">⚠️ You must agree to the following terms to complete registration:</p>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.termsOfServiceAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, termsOfServiceAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the Terms of Service (Required)</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.privacyPolicyAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, privacyPolicyAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the Privacy Policy (Required)</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.eventPhotoAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, eventPhotoAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the use of event photos/videos (Required)</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleTermsAgreement}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* 약관 동의 모달 */}
      {showTermsModal && <TermsModal />}
    </div>
  );
}
