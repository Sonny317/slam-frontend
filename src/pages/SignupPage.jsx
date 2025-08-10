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

  // ✅ 이메일 자동 중복 확인 (디바운스)
  useEffect(() => {
    if (!formData.email) {
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

    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match. Please check again.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must be 8+ characters and include a letter, a number, and a special symbol.");
      return;
    }

    if (!formData.termsOfServiceAgreed || !formData.privacyPolicyAgreed || !formData.eventPhotoAgreed) {
      alert("You must agree to all required terms.");
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
  };

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
          {/* 입력 필드 그룹 */}
          <div className="rounded-md -space-y-px">
            <div>
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode || resendCooldown > 0}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSendingCode ? "Sending..." : resendCooldown > 0 ? `Send Code (${resendCooldown}s)` : "Send Code"}
              </button>
            </div>
            {emailAvailable !== null && (
              <p className={`mt-1 text-xs ${emailAvailable ? "text-green-600" : "text-red-600"}`}>
                {emailAvailable ? "This email is available." : "This email is already registered."}
              </p>
            )}
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
          </div>

          {/* 약관 동의 그룹 (좌측 정렬 유지) */}
          <div className="space-y-4 text-sm text-left">
            <label className="flex items-center">
              <input type="checkbox" name="termsOfServiceAgreed" checked={formData.termsOfServiceAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900"> I agree to the <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">Terms of Service</a> (Required)
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="privacyPolicyAgreed" checked={formData.privacyPolicyAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900">  I agree to the <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">Privacy Policy</a> (Required)
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
    </div>
  );
}