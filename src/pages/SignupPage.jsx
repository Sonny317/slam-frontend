import React, { useState } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    affiliation: "",
    code: "",
    interests: [],
    spokenLanguages: "",
    desiredLanguages: "",
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    eventPhotoAgreed: false,
  });

  const affiliations = ["NCCU", "NTU", "NTNU", "Taipei Tech", "Other"];
  const interestOptions = ["K-POP", "Sports", "Movies", "Cooking", "Travel", "Gaming"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name !== "interests") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const newInterests = checked
        ? [...prev.interests, value]
        : prev.interests.filter((interest) => interest !== value);
      return { ...prev, interests: newInterests };
    });
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      return alert("인증코드를 받을 이메일을 먼저 입력해주세요.");
    }
    try {
      await axios.post("/auth/send-verification-code", { email: formData.email });
      alert("인증코드가 전송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      const errorMessage = error.response?.data || "인증코드 전송에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // ✅ 수정: 모든 필수 약관(이벤트 사진 포함)을 검사하도록 조건문 변경
    if (!formData.termsOfServiceAgreed || !formData.privacyPolicyAgreed || !formData.eventPhotoAgreed) {
      alert("모든 필수 약관에 동의해야 합니다.");
      return;
    }

    if (!formData.code) {
      alert("이메일 인증코드를 입력해주세요.");
      return;
    }
    try {
      const submissionData = {
        ...formData,
        interests: formData.interests.join(","),
      };
      await register(submissionData);
      alert("회원가입 성공! 이제 로그인 해보세요.");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data || err.message || "회원가입에 실패했습니다.";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="flex items-center mb-6">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

        <div className="space-y-4 mb-4">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <div className="flex gap-2">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="flex-grow px-4 py-2 border rounded" required />
            <button type="button" onClick={handleSendCode} className="px-4 bg-gray-300 rounded hover:bg-gray-400 text-sm whitespace-nowrap">
              Send Code
            </button>
          </div>
          <input type="text" name="code" placeholder="Verification Code" value={formData.code} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded" required />
          <select name="affiliation" value={formData.affiliation} onChange={handleChange} className="w-full px-4 py-2 border rounded bg-white" required>
            <option value="">소속 (Affiliation)</option>
            {affiliations.map(aff => <option key={aff} value={aff}>{aff}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">관심사 (Interests)</label>
          <div className="grid grid-cols-3 gap-2">
            {interestOptions.map(interest => (
              <label key={interest} className="flex items-center space-x-2">
                <input type="checkbox" name="interests" value={interest} checked={formData.interests.includes(interest)} onChange={handleInterestChange} />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input type="text" name="spokenLanguages" placeholder="구사 언어 (e.g., Korean, English)" value={formData.spokenLanguages} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
            <input type="text" name="desiredLanguages" placeholder="배우고 싶은 언어 (e.g., Chinese)" value={formData.desiredLanguages} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        </div>

        {/* ✅ 약관 동의 섹션 수정 */}
        <div className="space-y-2 mb-6 text-sm">
          <label className="flex items-center">
            <input type="checkbox" name="termsOfServiceAgreed" checked={formData.termsOfServiceAgreed} onChange={handleChange} className="mr-2" />
            <span>서비스 이용약관 (필수)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="privacyPolicyAgreed" checked={formData.privacyPolicyAgreed} onChange={handleChange} className="mr-2" />
            <span>개인정보 처리방침 (필수)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="eventPhotoAgreed" checked={formData.eventPhotoAgreed} onChange={handleChange} className="mr-2" />
            {/* ✅ "선택"을 "필수"로 텍스트 수정 */}
            <span>이벤트 사진 사용 동의 (필수)</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}