// src/pages/NewPostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function NewPostPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Free-form',
    content: '',
    pollOptions: [],
    location: null,
    pollSettings: {
      deadline: null,
      isAnonymous: false,
      allowMultipleVotes: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newPollOption, setNewPollOption] = useState('');


  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user?.isLoggedIn) {
    navigate('/login');
    return null;
  }

  const categories = [
    { id: 'Free-form', name: 'Free Talk', icon: '💬' },
    { id: 'Taipei Tips', name: 'Taipei Tips', icon: '🏙️' },
    { id: 'Travel Recs', name: 'Travel', icon: '✈️' },
    { id: 'Food & Drink', name: 'Food & Drink', icon: '🍕' },
    { id: 'Language Exchange', name: 'Language', icon: '🗣️' },
    { id: 'Events', name: 'Events', icon: '🎉' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      
      // 이미지가 있으면 먼저 업로드
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        const imageResponse = await axios.post('/api/admin/receipts/upload', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = imageResponse.data.url;
      }

      // 게시글 생성
      const response = await axios.post('/api/posts', {
        ...formData,
        imageUrl,
        author: user?.name || user?.email || 'Anonymous'
      });

      alert('Post published successfully!');
      navigate('/community', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('Image size must be 5MB or less.');
        return;
      }
      
      setImageFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };



  // ✅ 투표 관련 함수들
  const addPollOption = () => {
    if (newPollOption.trim() && formData.pollOptions.length < 6) {
      setFormData(prev => ({ 
        ...prev, 
        pollOptions: [...prev.pollOptions, newPollOption.trim()] 
      }));
      setNewPollOption('');
    }
  };

  const removePollOption = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      pollOptions: prev.pollOptions.filter((_, i) => i !== index) 
    }));
  };

  const handlePollKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPollOption();
    }
  };

  // ✅ 위치 관련 함수들
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // 구글 Maps API를 사용해 주소 변환 (실제 구현 시 필요)
          setFormData(prev => ({ 
            ...prev, 
            location: {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
          }));
        },
        (error) => {
          alert('위치를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
        }
      );
    } else {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  };

  const removeLocation = () => {
    setFormData(prev => ({ ...prev, location: null }));
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Category Selection (Desktop only) */}
          <div className="hidden md:block w-64 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Category</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    formData.category === cat.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-100'
                  }`}
                >
                  <span className={`text-xl ${
                    formData.category === cat.id ? 'text-white' : ''
                  }`}>
                    {cat.icon}
                  </span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/community')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Post</h1>
            </div>
            <div className="flex items-center justify-end w-full sm:w-auto">
              <button
                form="post-form"
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Category Selection */}
          <div className="block md:hidden mb-6">
            <label htmlFor="category-mobile" className="block text-sm font-semibold text-gray-700 mb-3">
              Category
            </label>
            <select
              id="category-mobile"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's on your mind?"
                required
              />
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-3">
                  Content
                </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts, experiences, or ask questions... Use #hashtags to tag your content!"
                required
              />
            </div>



            {/* Poll Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Poll (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPollCreator(!showPollCreator)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showPollCreator ? '📊 Hide Poll' : '📊 Add Poll'}
                </button>
              </div>
              
              {showPollCreator && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-4">
                    {/* Poll Options */}
                    <div className="space-y-3">
                      {formData.pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 w-6">{index + 1}.</span>
                          <div className="flex-1 bg-white px-3 py-2 rounded border">
                            {option}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {formData.pollOptions.length < 6 && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newPollOption}
                            onChange={(e) => setNewPollOption(e.target.value)}
                            onKeyPress={handlePollKeyPress}
                            placeholder="Add poll option..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={addPollOption}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Add Option
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* ✅ Poll Settings */}
                    {formData.pollOptions.length >= 2 && (
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Poll Settings</h4>
                        
                        {/* Deadline */}
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={!!formData.pollSettings.deadline}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  setFormData(prev => ({
                                    ...prev,
                                    pollSettings: {
                                      ...prev.pollSettings,
                                      deadline: tomorrow.toISOString().slice(0, 16)
                                    }
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    pollSettings: { ...prev.pollSettings, deadline: null }
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Set voting deadline</span>
                          </label>
                          {formData.pollSettings.deadline && (
                            <input
                              type="datetime-local"
                              value={formData.pollSettings.deadline}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pollSettings: { ...prev.pollSettings, deadline: e.target.value }
                              }))}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                        
                        {/* Anonymous Voting */}
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.pollSettings.isAnonymous}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pollSettings: { ...prev.pollSettings, isAnonymous: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Anonymous voting</span>
                          </label>
                        </div>
                        
                        {/* Multiple Votes */}
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.pollSettings.allowMultipleVotes}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                pollSettings: { ...prev.pollSettings, allowMultipleVotes: e.target.checked }
                              }))}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Allow multiple choices</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Add 2-6 poll options. Configure settings to customize voting behavior.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location (Optional)
              </label>
              {formData.location ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">📍</span>
                    <span className="text-sm text-green-800">{formData.location.address}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeLocation}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>📍</span>
                  <span className="text-sm">Add Current Location</span>
                </button>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Attach Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 mb-2">Click to upload an image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="mt-4 inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
