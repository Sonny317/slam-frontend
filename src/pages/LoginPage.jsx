import React, { useState } from "react";
import { login } from "../api/auth"; // 로그인 API
import { useNavigate } from "react-router-dom"; // 페이지 이동 훅

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ 페이지 이동 함수 준비

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password); // 로그인 요청
      alert("로그인 성공!");
      console.log(result); // 토큰 확인 등
      navigate("/"); // ✅ 메인 페이지로 이동
    } catch (error) {
      alert("로그인 실패: " + (error?.message || error));
      console.error("로그인 에러:", error);
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
      </form>
    </div>
  );
}
