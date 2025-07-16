// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// 나중에는 실제 API 함수를 import 해야 합니다.
// import { requestPasswordReset } from '../api/auth'; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // 이 부분에서 실제 백엔드 API를 호출하게 됩니다.
      // await requestPasswordReset(email); 
      
      // 지금은 성공했다고 가정하고 시뮬레이션합니다.
      console.log(`Password reset link requested for: ${email}`);
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (error) {
      // 실제 앱에서는 보안을 위해 이메일 존재 여부를 알려주지 않으므로,
      // 성공/실패 여부와 관계없이 동일한 메시지를 보여주는 것이 좋습니다.
      setMessage('If an account with that email exists, a password reset link has been sent.');
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center mb-8">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-10 h-10 rounded-full mr-2" />
        <span className="text-2xl font-bold text-gray-800">SLAM</span>
      </div>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-center">Forgot Password?</h2>
        <p className="text-center text-gray-500 mb-6">No worries, we'll send you reset instructions.</p>
        
        {message ? (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-6 px-4 py-2 border rounded"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center text-sm mt-6">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 hover:underline">
            &larr; Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
