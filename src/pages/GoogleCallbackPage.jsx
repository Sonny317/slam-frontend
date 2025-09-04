import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from '../api/axios';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    termsOfServiceAgreed: false,
    privacyPolicyAgreed: false,
    eventPhotoAgreed: false,
  });

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError('Google login error occurred.');
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('Authorization code not received.');
          setIsProcessing(false);
          return;
        }

        // Send authorization code to backend
        console.log('Sending code to backend:', code);
        const response = await axios.post('/api/auth/google/callback', { code });
        
        console.log('Google callback response:', response.data);
        
        if (response.data && response.data.isNewUser) {
          // For new users, show terms agreement modal
          console.log('New user detected, showing terms agreement modal');
          setGoogleUserData(response.data.userData);
          setShowTermsModal(true);
          setIsProcessing(false);
        } else if (response.data && response.data.token) {
          // For existing users, login immediately
          localStorage.setItem('jwtToken', response.data.token);
          
          // Store Google OAuth user info in localStorage
          localStorage.setItem('userEmail', response.data.email);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('userRole', response.data.role);
          localStorage.setItem('profileImage', response.data.profileImage || '');
          
2          // Update user context immediately without delay
          await login(response.data.email, response.data.token);
          navigate('/');
        } else {
          console.error('No token in response:', response.data);
          setError('Login processing error occurred. Token not received.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error response headers:', error.response?.headers);
        
        // 백엔드에서 400 에러를 반환하지만 실제로는 성공적인 데이터가 있는 경우
        if (error.response && error.response.data && error.response.data.isNewUser) {
          console.log('New user detected from error response, showing terms agreement modal');
          setGoogleUserData(error.response.data.userData);
          setShowTermsModal(true);
          setIsProcessing(false);
        } else if (error.response && error.response.data && error.response.data.token) {
          // 토큰이 있는 경우 성공으로 처리
          console.log('Token found in error response, processing as success');
          localStorage.setItem('jwtToken', error.response.data.token);
          localStorage.setItem('userEmail', error.response.data.email);
          localStorage.setItem('userName', error.response.data.name);
          localStorage.setItem('userRole', error.response.data.role);
          localStorage.setItem('profileImage', error.response.data.profileImage || '');
          
          await login(error.response.data.email, error.response.data.token);
          navigate('/');
                 } else {
           // Google OAuth 오류 메시지 확인
           const errorMessage = error.response?.data?.error || error.message;
           
           if (errorMessage.includes('Authorization code expired') || errorMessage.includes('invalid_grant')) {
             setError('Your Google login session has expired. Please try logging in again.');
           } else {
             setError('Google login processing error occurred.');
           }
           setIsProcessing(false);
         }
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  // Terms agreement handling function
  const handleTermsAgreement = async () => {
    if (!formData.termsOfServiceAgreed || !formData.privacyPolicyAgreed || !formData.eventPhotoAgreed) {
      alert("Please agree to all required terms.");
      return;
    }

    try {
      // Call registration API
      const registerData = {
        name: googleUserData.name,
        email: googleUserData.email,
        password: "", // Google OAuth users don't have password
        code: null, // Google OAuth users don't need verification code
        termsOfServiceAgreed: formData.termsOfServiceAgreed,
        privacyPolicyAgreed: formData.privacyPolicyAgreed,
        eventPhotoAgreed: formData.eventPhotoAgreed,
        isGoogleUser: true,
        googleId: googleUserData.providerId || "google_" + googleUserData.email // Fallback if providerId is null
      };

      console.log("Sending register data:", registerData);

      const registerResponse = await axios.post('/auth/register', registerData);
      
      // After successful registration, login immediately
      if (registerResponse.data && registerResponse.data.token) {
        // Store token in localStorage
        localStorage.setItem('jwtToken', registerResponse.data.token);
        localStorage.setItem('userEmail', registerResponse.data.email);
        localStorage.setItem('userName', registerResponse.data.name);
        localStorage.setItem('userRole', registerResponse.data.role);
        localStorage.setItem('profileImage', registerResponse.data.profileImage || '');
        
        // Update user context immediately without delay
        await login(googleUserData.email, registerResponse.data.token);
        alert("Registration and login successful!");
        setShowTermsModal(false);
        navigate("/");
      } else {
        // If no token in response, handle appropriately for Google users
        console.warn("No token in registration response");
        alert("Registration successful! Please contact support for login assistance.");
        setShowTermsModal(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data;
        if (typeof errorMessage === 'string' && errorMessage.includes('already exists')) {
          alert("This email is already registered. Please try logging in instead.");
          setShowTermsModal(false);
          navigate("/login");
        } else {
          alert("Registration failed: " + errorMessage);
        }
      } else if (error.response?.status === 500) {
        alert("Server error occurred. Please try again later.");
      } else {
        alert("Registration failed: " + (error.response?.data || error.message));
      }
    }
  };

  // Terms agreement modal component
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Terms Agreement Required</h2>
            <button 
              onClick={() => setShowTermsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-sm text-gray-700 mb-6">
            <p className="text-red-600 font-medium">⚠️ You must agree to the following terms to complete registration:</p>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.termsOfServiceAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, termsOfServiceAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the Terms of Service (Required)</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.privacyPolicyAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, privacyPolicyAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the Privacy Policy (Required)</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.eventPhotoAgreed} 
                  onChange={(e) => setFormData(prev => ({...prev, eventPhotoAgreed: e.target.checked}))} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2">I agree to the use of event photos/videos (Required)</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleTermsAgreement}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Google login...</h2>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    );
  }

     if (error) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
         <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
           <div className="text-red-500 text-6xl mb-4">❌</div>
           <h2 className="text-xl font-semibold mb-2 text-red-600">Login Failed</h2>
           <p className="text-gray-600 mb-4">{error}</p>
           <div className="flex gap-3 justify-center">
             <button
               onClick={() => window.location.href = '/login'}
               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
             >
               Go to Login Page
             </button>
             {error.includes('expired') && (
               <button
                 onClick={() => window.location.reload()}
                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
               >
                 Try Again
               </button>
             )}
           </div>
         </div>
       </div>
     );
   }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Terms agreement modal */}
      {showTermsModal && <TermsModal />}
    </div>
  );
}
