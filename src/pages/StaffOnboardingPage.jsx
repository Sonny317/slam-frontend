import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function StaffOnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nationality: '',
    studentId: '',
    major: '',
    phoneNumber: '',
    university: '',
    team: '',
    bio: '',
    affiliation: ''
  });

  const teamOptions = [
    'GA (General Affairs)',
    'EP (Event Planning)',
    'PR (Public Relations)', 
    'Other'
  ];

  // URL에서 토큰 추출
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      fetchTokenInfo(tokenParam);
    } else {
      alert('Invalid access.');
      navigate('/');
    }
  }, [location, navigate]);

  // 토큰 정보 조회
  const fetchTokenInfo = async (tokenValue) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/staff/onboarding/${tokenValue}`);
      
      if (response.data.success) {
        setTokenInfo(response.data.data);
      } else {
        alert(response.data.message);
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load token information.';
      alert(errorMessage);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Required fields
    const requiredFields = ['nationality', 'major', 'phoneNumber', 'university', 'team'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields.');
      return;
    }

    // If Other is selected, require custom affiliation/team input
    if (formData.team === 'Other' && !formData.affiliation.trim()) {
      alert('Please enter your affiliation/team for "Other".');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = { token: token, ...formData };
      if (payload.team === 'Other') {
        payload.team = (formData.affiliation || '').trim();
      }
      const response = await axios.post('/api/staff/onboarding/complete', payload);
      
      if (response.data.success) {
        alert(response.data.message);
        navigate('/login'); // redirect after completion
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete onboarding.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/slam_logo_web_rgb.jpg" 
            alt="SLAM Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Congratulations! 🎉</h1>
          <p className="mt-2 text-gray-600">You have been appointed as SLAM {tokenInfo?.targetRole}.</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Assigned by:</strong> {tokenInfo?.assignedBy}<br/>
              <strong>Target role:</strong> {tokenInfo?.targetRole}<br/>
              <strong>Expires on:</strong> {new Date(tokenInfo?.expiryDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Please provide your details to start staff activities</h2>
            </div>

            {/* Nationality */}
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                required
                value={formData.nationality}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Korea, Taiwan, Japan"
              />
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID (optional)
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 110512345"
              />
            </div>

            {/* Major */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                Major <span className="text-red-500">*</span>
              </label>
              <input
                id="major"
                name="major"
                type="text"
                required
                value={formData.major}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ICI-3"
              />
              <p className="mt-1 text-xs text-gray-500">Format: Department-Grade. Example: ICI-3</p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 010-1234-5678"
              />
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                University <span className="text-red-500">*</span>
              </label>
              <input
                id="university"
                name="university"
                type="text"
                required
                value={formData.university}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Seoul National University, NCCU"
              />
            </div>

            {/* Affiliation / Team */}
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                Affiliation / Team <span className="text-red-500">*</span>
              </label>
              <select
                id="team"
                name="team"
                required
                value={formData.team}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Please select your team</option>
                {teamOptions.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              {formData.team === 'Other' && (
                <input
                  id="affiliation"
                  name="affiliation"
                  type="text"
                  value={formData.affiliation}
                  onChange={handleInputChange}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your affiliation/team"
                />
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio (optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Once completed, you can start your activities as SLAM staff. You can manage these details later in My Page.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
