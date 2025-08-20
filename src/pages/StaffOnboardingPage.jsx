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
    'PR (Public Relations)', 
    'EP (Event Planning)',
    'Finance',
    'IT',
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
      alert('유효하지 않은 접근입니다.');
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
      const errorMessage = error.response?.data?.message || '토큰 정보를 불러오는데 실패했습니다.';
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
    
    // 필수 필드 검증
    const requiredFields = ['nationality', 'major', 'phoneNumber', 'university', 'team'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.post('/api/staff/onboarding/complete', {
        token: token,
        ...formData
      });
      
      if (response.data.success) {
        alert(response.data.message);
        navigate('/login'); // 완료 후 로그인 페이지로 이동
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '온보딩 완료에 실패했습니다.';
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
          <p className="mt-4 text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <img 
            src="/slam_logo_web_rgb.jpg" 
            alt="SLAM Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">
            축하합니다! 🎉
          </h1>
          <p className="mt-2 text-gray-600">
            SLAM {tokenInfo?.targetRole} 스태프로 임명되셨습니다
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>임명자:</strong> {tokenInfo?.assignedBy}<br/>
              <strong>대상 역할:</strong> {tokenInfo?.targetRole}<br/>
              <strong>만료일:</strong> {new Date(tokenInfo?.expiryDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                스태프 활동을 위해 상세 정보를 입력해주세요
              </h2>
            </div>

            {/* 국적 */}
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                국적 <span className="text-red-500">*</span>
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                required
                value={formData.nationality}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 한국, 대만, 일본"
              />
            </div>

            {/* 학번 */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                학번 (선택사항)
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 110512345"
              />
            </div>

            {/* 전공 */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                전공 <span className="text-red-500">*</span>
              </label>
              <input
                id="major"
                name="major"
                type="text"
                required
                value={formData.major}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 컴퓨터공학, 경영학"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 010-1234-5678"
              />
            </div>

            {/* 소속 학교 */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                소속 학교 <span className="text-red-500">*</span>
              </label>
              <input
                id="university"
                name="university"
                type="text"
                required
                value={formData.university}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 서울대학교, 政治大學"
              />
            </div>

            {/* 소속 팀 */}
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                소속 팀 <span className="text-red-500">*</span>
              </label>
              <select
                id="team"
                name="team"
                required
                value={formData.team}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">팀을 선택해주세요</option>
                {teamOptions.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* 자기소개 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                자기소개 (선택사항)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="자신을 소개해주세요..."
              />
            </div>

            {/* 제출 버튼 */}
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
                    처리 중...
                  </>
                ) : (
                  '온보딩 완료'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                정보 입력을 완료하면 SLAM 스태프로서의 활동을 시작할 수 있습니다.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
