import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token'); // URL에서 토큰을 가져옵니다.
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    // TODO: 비밀번호 규칙 검사 추가 가능
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('/auth/reset-password', { token, newPassword: password });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Your Password</h2>
        
        {message ? (
          <div>
            <p className="p-4 text-green-700 bg-green-100 rounded-lg">{message}</p>
            <Link to="/login" className="block text-center mt-4 text-blue-600 hover:underline">
              Proceed to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full mb-6 px-4 py-2 border rounded"
              required
            />
            {error && <p className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            {!token && <p className="text-xs text-red-500 text-center mt-2">Invalid or missing reset token.</p>}
          </form>
        )}
      </div>
    </div>
  );
}