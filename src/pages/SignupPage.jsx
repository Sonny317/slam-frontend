import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, sendVerificationCode, checkEmail } from "../api/auth"; 

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // null | true | false
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
    setIsSendingCode(true);
    try {
      await sendVerificationCode(formData.email);
      alert("A verification code has been sent. Please check your email.");
    } catch (error) {
      alert("Failed to send code: " + (error.response?.data || error.message));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.email) {
      alert("Please enter your email first.");
      return;
    }
    setIsCheckingEmail(true);
    try {
      const { available } = await checkEmail(formData.email);
      setEmailAvailable(available);
      if (available) {
        alert("This email is available.");
      } else {
        alert("This email is already registered.");
      }
    } catch (error) {
      alert("Failed to check email: " + (error.error || error.message || error));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match. Please check again.");
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must be at least 6 characters and include a special character.");
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
    try {
      await register(formData);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed: " + (err.response?.data || err.message));
    }
  };

  return (
    // ✅ 전체 화면을 중앙 정렬하는 컨테이너로 수정
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ✅ 너비와 간격을 담당하는 내부 컨테이너 추가 */}
      <div className="max-w-md w-full space-y-8">
        {/* 1. 로고와 제목 섹션 */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-12 h-12 rounded-full mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
        </div>

        {/* 2. Form 섹션 */}
        <form onSubmit={handleSignup} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
          {/* 입력 필드 그룹 */}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  setEmailAvailable(null);
                }}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={isCheckingEmail}
                className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium whitespace-nowrap ${
                  isCheckingEmail ? "bg-gray-200 text-gray-500" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isCheckingEmail ? "Checking..." : "Check Email"}
              </button>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSendingCode ? "Sending..." : "Send Code"}
              </button>
            </div>
            {emailAvailable !== null && (
              <p className={`mt-1 text-xs ${emailAvailable ? "text-green-600" : "text-red-600"}`}>
                {emailAvailable ? "This email is available." : "This email is already registered."}
              </p>
            )}
            <div>
              <input type="text" name="code" placeholder="Verification Code" value={formData.code} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
            <div>
              <input type="password" name="password" placeholder="Password (6+ characters, with special symbol)" value={formData.password} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
            <div>
              <input type="password" name="passwordConfirm" placeholder="Confirm Password" value={formData.passwordConfirm} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
          </div>

          {/* 약관 동의 그룹 */}
          <div className="space-y-4 text-sm">
            <label className="flex items-center">
              <input type="checkbox" name="termsOfServiceAgreed" checked={formData.termsOfServiceAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900">
                I agree to the <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">Terms of Service</a> (Required)
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="privacyPolicyAgreed" checked={formData.privacyPolicyAgreed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="ml-2 text-gray-900">
                I agree to the <a href="#" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">Privacy Policy</a> (Required)
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