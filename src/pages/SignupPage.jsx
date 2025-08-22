import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, sendVerificationCode, checkEmail, verifyCode } from "../api/auth"; 

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // null | true | false
  // ✅ 인증 관련 상태
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // 60초 쿨다운
  const [codeTimer, setCodeTimer] = useState(0); // 180초 타이머
  // ✅ 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // ✅ 구글 OAuth 상태
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    code: "", 
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    eventPhotoAgreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === 'code') {
      setIsVerified(false);
    }
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      alert("Please enter your email to receive a verification code.");
      return;
    }
    if (emailAvailable === false) {
      alert("This email is already registered. Please use a different email.");
      return;
    }
    if (resendCooldown > 0) {
      return;
    }
    setIsSendingCode(true);
    try {
      await sendVerificationCode(formData.email);
      alert("A verification code has been sent. Please check your email.");
      setResendCooldown(60); // 60초 쿨다운 시작
      setCodeTimer(180); // 3분 타이머 시작
      setIsVerified(false); // 새 코드 발송 시 검증 상태 초기화
    } catch (error) {
      const msg = error?.response?.data || error?.message || String(error);
      // 서버에서 "Please wait X seconds ..." 메시지 파싱
      const match = /Please wait\s+(\d+)\s+seconds/i.exec(msg);
      if (match) {
        const secondsLeft = parseInt(match[1], 10);
        if (!Number.isNaN(secondsLeft)) setResendCooldown(secondsLeft);
      }
      alert("Failed to send code: " + msg);
    } finally {
      setIsSendingCode(false);
    }
  };

  // ✅ 이메일 형식 검증
  const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ 이메일 자동 중복 확인 (디바운스) - 형식 검증 추가
  useEffect(() => {
    if (!formData.email) {
      setEmailAvailable(null);
      return;
    }
    
    // 이메일 형식이 올바르지 않으면 중복 확인하지 않음
    if (!isValidEmailFormat(formData.email)) {
      setEmailAvailable(null);
      return;
    }
    
    const emailValue = formData.email;
    const id = setTimeout(async () => {
      try {
        const { available } = await checkEmail(emailValue);
        // 입력 도중 이전 요청 응답이 도착하는 경우 방지
        if (emailValue === formData.email) {
          setEmailAvailable(available);
        }
      } catch (_) {
        // 무시: 네트워크 에러 시 상태 유지
      }
    }, 500);
    return () => clearTimeout(id);
  }, [formData.email]);

  const handleVerify = async () => {
    if (!formData.email || !formData.code) {
      alert("Enter email and verification code.");
      return;
    }
    setIsVerifying(true);
    try {
      const { valid } = await verifyCode(formData.email, formData.code);
      if (valid) {
        setIsVerified(true);
        alert("Email verified.");
      } else {
        setIsVerified(false);
        alert("Invalid or expired code.");
      }
    } catch (e) {
      setIsVerified(false);
      alert(typeof e === 'string' ? e : (e.error || e.message || 'Verification failed'));
    } finally {
      setIsVerifying(false);
    }
  };

  // ✅ 타이머 이펙트: 1초 간격으로 resendCooldown 과 codeTimer 감소
  useEffect(() => {
    if (resendCooldown <= 0 && codeTimer <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
      setCodeTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown, codeTimer]);

  const handleSignup = async (e) => {
    e.preventDefault();

    // 약관 동의 확인 (공통)
    if (!formData.termsOfServiceAgreed || !formData.privacyPolicyAgreed || !formData.eventPhotoAgreed) {
      alert("You must agree to all required terms.");
      return;
    }

    if (isGoogleSignup) {
      // ✅ 구글 로그인의 경우 간단한 처리
      try {
        const googleRegisterData = {
          ...formData,
          isGoogleUser: true,
          googleId: googleUserData?.id
        };
        await register(googleRegisterData);
        alert("Google signup successful! Please log in.");
        navigate("/login");
      } catch (err) {
        alert("Google signup failed: " + (err.response?.data || err.message));
      }
    } else {
      // ✅ 일반 이메일 회원가입 처리
      if (formData.password !== formData.passwordConfirm) {
        alert("Passwords do not match. Please check again.");
        return;
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        alert("Password must be 8+ characters and include a letter, a number, and a special symbol.");
        return;
      }

      if (!formData.code) {
        alert("Please enter the verification code.");
        return;
      }
      if (!isVerified) {
        alert("Please verify your code first.");
        return;
      }
      try {
        await register(formData);
        alert("Signup successful! Please log in.");
        navigate("/login");
      } catch (err) {
        alert("Signup failed: " + (err.response?.data || err.message));
      }
    }
  };

  // ✅ 구글 로그인 핸들러
  const handleGoogleSignup = () => {
    // Google OAuth URL로 리다이렉트
    window.location.href = '/api/auth/google';
  };

  // ✅ 구글 OAuth 콜백 처리 (URL 파라미터에서 사용자 정보 받기)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleUser = urlParams.get('googleUser');
    if (googleUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(googleUser));
        setGoogleUserData(userData);
        setIsGoogleSignup(true);
        setFormData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          // 구글 로그인은 이메일 인증 불필요
        }));
        setIsVerified(true);
        setEmailAvailable(true);
      } catch (error) {
        console.error('Failed to parse Google user data:', error);
      }
    }
  }, []);

  // ✅ Terms of Service 모달 컴포넌트
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Terms of Service</h2>
            <button 
              onClick={() => setShowTermsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <h3 className="font-semibold">1. Acceptance of Terms</h3>
            <p>By using SLAM services, you agree to these terms and conditions.</p>
            
            <h3 className="font-semibold">2. Membership and Events</h3>
            <p>SLAM membership grants access to events, networking opportunities, and community activities. Members are expected to participate respectfully and follow event guidelines.</p>
            
            <h3 className="font-semibold">3. Code of Conduct</h3>
            <p>All members must maintain respectful behavior during events and online interactions. Discrimination, harassment, or inappropriate conduct will result in membership termination.</p>
            
            <h3 className="font-semibold">4. Event Participation</h3>
            <p>Event RSVPs are binding. Please cancel at least 24 hours in advance if you cannot attend. No-shows may affect future event privileges.</p>
            
            <h3 className="font-semibold">5. Liability</h3>
            <p>SLAM is not liable for any injuries, losses, or damages that may occur during events or activities.</p>
            
            <h3 className="font-semibold">6. Termination</h3>
            <p>SLAM reserves the right to terminate memberships for violations of these terms or inappropriate conduct.</p>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowTermsModal(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Privacy Policy 모달 컴포넌트
  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Privacy Policy</h2>
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <h3 className="font-semibold">1. Information We Collect</h3>
            <p>We collect your name, email, student ID, major, and contact information for membership management and event coordination.</p>
            
            <h3 className="font-semibold">2. How We Use Your Information</h3>
            <p>Your information is used to manage membership, send event notifications, and improve our services. We do not sell your data to third parties.</p>
            
            <h3 className="font-semibold">3. Data Storage and Security</h3>
            <p>Your data is securely stored and protected. We implement appropriate security measures to prevent unauthorized access.</p>
            
            <h3 className="font-semibold">4. Communication</h3>
            <p>We may send you event updates, newsletters, and important announcements related to SLAM activities.</p>
            
            <h3 className="font-semibold">5. Your Rights</h3>
            <p>You can request access to, correction of, or deletion of your personal data by contacting us.</p>
            
            <h3 className="font-semibold">6. Contact Information</h3>
            <p>For questions about this privacy policy, please contact us through our official channels.</p>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // ✅ 레이아웃 정돈: 제목 중앙, 폼 및 약관은 왼쪽 정렬
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-12 h-12 rounded-full mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Your Account</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-6 bg-white p-8 rounded-lg shadow-md text-left">
          {/* ✅ 구글 로그인 버튼 */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div className="mt-4 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or sign up with email</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>

          {/* 입력 필드 그룹 */}
          <div className="rounded-md -space-y-px">
            <div>
              <input 
                type="text" 
                name="name" 
                placeholder="Name" 
                value={formData.name} 
                onChange={handleChange} 
                disabled={isGoogleSignup}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isGoogleSignup ? 'bg-gray-100' : ''}`}
                required 
              />
            </div>
            <div className="flex gap-2 items-stretch">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  setEmailAvailable(null);
                  setIsVerified(false);
                }}
                disabled={isGoogleSignup}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isGoogleSignup ? 'bg-gray-100' : ''}`}
                required
              />
              {!isGoogleSignup && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || resendCooldown > 0}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSendingCode ? "Sending..." : resendCooldown > 0 ? `Send Code (${resendCooldown}s)` : "Send Code"}
                </button>
              )}
            </div>
            {formData.email && (
              <p className={`mt-1 text-xs ${
                !isValidEmailFormat(formData.email) 
                  ? "text-red-600" 
                  : emailAvailable === true 
                    ? "text-green-600" 
                    : emailAvailable === false 
                      ? "text-red-600" 
                      : "text-gray-500"
              }`}>
                {!isValidEmailFormat(formData.email) 
                  ? "Please enter a valid email address."
                  : emailAvailable === true 
                    ? "✅ This email is available."
                    : emailAvailable === false 
                      ? "❌ This email is already registered."
                      : "⏳ Checking email availability..."
                }
              </p>
            )}
            {!isGoogleSignup && (
              <>
                <div className="flex gap-2 items-stretch">
                  <input type="text" name="code" placeholder="Verification Code" value={formData.code} onChange={handleChange} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || !formData.code}
                    className="relative inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isVerifying ? "Verifying..." : isVerified ? "Verified" : "Verify"}
                  </button>
                </div>
                {codeTimer > 0 && !isVerified && (
                  <p className="mt-1 text-xs text-gray-600">Code expires in {Math.floor(codeTimer/60)}:{String(codeTimer%60).padStart(2,'0')}</p>
                )}
                <div>
                  <input type="password" name="password" placeholder="Password (8+ chars, include letter, number, special)" value={formData.password} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                <div>
                  <input type="password" name="passwordConfirm" placeholder="Confirm Password" value={formData.passwordConfirm} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
                )}
              </>
            )}
            
            {/* ✅ 구글 로그인 시 안내 메시지 */}
            {isGoogleSignup && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">✅ Signed in with Google</p>
                <p className="text-green-600 text-sm mt-1">Please agree to the terms below to complete registration</p>
              </div>
            )}
          </div>

          {/* 약관 동의 그룹 (좌측 정렬 유지) */}
          <div className="space-y-4 text-sm text-left">
            <label className="flex items-center">
              <input type="checkbox" name="termsOfServiceAgreed" checked={formData.termsOfServiceAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900"> I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="font-medium text-blue-600 hover:text-blue-800 underline">Terms of Service</button> (Required)
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="privacyPolicyAgreed" checked={formData.privacyPolicyAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900">  I agree to the <button type="button" onClick={() => setShowPrivacyModal(true)} className="font-medium text-blue-600 hover:text-blue-800 underline">Privacy Policy</button> (Required)
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="eventPhotoAgreed" checked={formData.eventPhotoAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900">I agree to the use of event photos/videos (Required)</span>
            </label>
          </div>

          {/* 제출 버튼 */}
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Create Account
            </button>
          </div>
        </form>

        {/* 3. 하단 링크 섹션 */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log In
          </Link>
        </p>
      </div>
      
      {/* ✅ 모달들 */}
      {showTermsModal && <TermsModal />}
      {showPrivacyModal && <PrivacyModal />}
    </div>
  );
}