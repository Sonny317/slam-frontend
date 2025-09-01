import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // ✅ 약관 동의 모달 상태 추가
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    eventPhotoAgreed: false,
  });
  const navigate = useNavigate();
  const { login } = useUser();

  // ✅ Google OAuth 콜백 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Google OAuth 콜백 처리
      handleGoogleCallback(code);
    }
  }, []);

  // ✅ Google OAuth 콜백 핸들러
  const handleGoogleCallback = async (code) => {
    setIsGoogleLoading(true);
    try {
      const response = await axios.post('/api/auth/google/callback', { code });
      
      if (response.data.isNewUser) {
        // 신규 사용자인 경우 약관 동의 모달 표시
        setGoogleUserData(response.data.userData);
        setShowTermsModal(true);
      } else if (response.data.token) {
        // 기존 사용자인 경우 바로 로그인 처리
        await login(response.data.email, response.data.token);
        alert("Google login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Google callback error:", error);
      alert("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ✅ 구글 로그인 핸들러 - 백엔드 API 호출
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await axios.get('/api/auth/google/login');
      
      if (response.data && response.data.authUrl) {
        // Google OAuth 페이지로 리다이렉트
        window.location.href = response.data.authUrl;
      } else {
        alert("Google 로그인 기능이 아직 준비 중입니다. 일반 로그인을 사용해주세요.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (error.response?.status === 404) {
        alert("Google 로그인 기능이 아직 준비 중입니다. 일반 로그인을 사용해주세요.");
      } else {
        alert("Google 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Login successful!");
      navigate("/"); // ✅ 상태 업데이트 후 자연스럽게 메인 페이지로 이동합니다.
    } catch (error) {
      alert("Login failed: " + (error?.message || "Please check your email and password."));
      console.error("Login error:", error);
    }
  };

  // ✅ 약관 동의 처리 함수
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

      await axios.post('/api/auth/register', registerData);
      alert("Registration successful! Please log in.");
      setShowTermsModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + (error.response?.data || error.message));
    }
  };

  // ✅ 약관 동의 모달 컴포넌트
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center mb-8">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Log In</h2>
        
        {/* ✅ 구글 로그인 버튼 - 로딩 상태 추가 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className={`w-full flex justify-center items-center py-3 px-4 mb-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isGoogleLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
              Signing in...
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        
        <div className="mb-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Log In
        </button>
        <div className="text-center text-sm mt-6">
          <Link to="/forgot-password" className="text-gray-600 hover:text-blue-600 hover:underline">
            Forgot Password?
          </Link>
          <span className="mx-2 text-gray-300">|</span>
          <Link to="/signup" className="text-gray-600 hover:text-blue-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </form>
      
      {/* ✅ 약관 동의 모달 */}
      {showTermsModal && <TermsModal />}
    </div>
  );
}