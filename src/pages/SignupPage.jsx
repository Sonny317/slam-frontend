import React, { useState } from "react";
import { register } from "../api/auth"; // ✅ 백엔드 API 함수 가져오기

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      alert("회원가입 성공! 이제 로그인 해보세요.");
    } catch (err) {
      alert("회원가입 실패: " + err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center mb-8">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
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
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-grow px-4 py-2 border rounded"
          />
          <button
            type="button"
            className="px-4 bg-gray-300 rounded hover:bg-gray-400 text-sm"
            onClick={() => console.log("인증코드 전송")}
          >
            Send Code
          </button>
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}
