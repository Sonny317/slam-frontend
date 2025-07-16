// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { login } from "../api/auth"; // 로그인 API
import { Link, useNavigate } from "react-router-dom"; // ✅ Link를 import 합니다.

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password); // 로그인 요청
      alert("Login successful!");
      console.log(result); // 토큰 확인 등
      navigate("/"); // 메인 페이지로 이동
    } catch (error) {
      alert("Login failed: " + (error?.message || "Please check your email and password."));
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center mb-8">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Log In</h2>
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
        
        {/* ✅ '비밀번호 찾기'와 '회원가입' 링크 추가 */}
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
    </div>
  );
}
