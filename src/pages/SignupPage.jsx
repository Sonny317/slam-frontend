import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, sendVerificationCode } from "../api/auth"; 

export default function SignupPage() {
  const navigate = useNavigate();
  const [isSendingCode, setIsSendingCode] = useState(false);
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
    setIsSendingCode(true);
    try {
      await sendVerificationCode(formData.email);
      alert("A verification code has been sent. Please check your email.");
    } catch (error) {
      alert("Failed to send code: " + (error.message || error));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match. Please check again.");
      return;
    }

    // ✅ 1. 비밀번호 규칙 검사 수정 (6자 이상, 특수기호 포함)
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
      // 현재 코드의 데이터 전송 방식을 그대로 유지합니다.
      const { name, email, password, code } = formData;
      await register({ name, email, password, code });
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="flex items-center mb-6">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Your Account</h2>
        <div className="space-y-4">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <div className="flex gap-2">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="flex-grow px-4 py-2 border rounded" required />
            <button type="button" onClick={handleSendCode} disabled={isSendingCode} className="px-4 bg-gray-200 rounded hover:bg-gray-300 text-sm whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSendingCode ? "Sending..." : "Send Code"}
            </button>
          </div>
          <input type="text" name="code" placeholder="Verification Code" value={formData.code} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          {/* ✅ 2. placeholder 텍스트 수정 */}
          <input type="password" name="password" placeholder="Password (6+ characters, with special symbol)" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <input type="password" name="passwordConfirm" placeholder="Confirm Password" value={formData.passwordConfirm} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
        </div>

        <div className="space-y-2 my-6 text-sm">
          <label className="flex items-center">
            <input type="checkbox" name="termsOfServiceAgreed" checked={formData.termsOfServiceAgreed} onChange={handleChange} className="mr-2" />
            <span className="ml-2">
              I agree to the <a href="YOUR_NOTION_LINK_FOR_TERMS" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">Terms of Service</a> (Required)
            </span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="privacyPolicyAgreed" checked={formData.privacyPolicyAgreed} onChange={handleChange} className="mr-2" />
            <span className="ml-2">
              I agree to the <a href="YOUR_NOTION_LINK_FOR_PRIVACY" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">Privacy Policy</a> (Required)
            </span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="eventPhotoAgreed" checked={formData.eventPhotoAgreed} onChange={handleChange} className="mr-2" />
            <span>I agree to the use of event photos/videos (Required)</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Create Account
        </button>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
}