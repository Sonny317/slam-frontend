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
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isBold, setIsBold] = useState(false);

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

  const insertBoldText = () => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    if (selectedText) {
      const newText = formData.content.substring(0, start) + 
                     `**${selectedText}**` + 
                     formData.content.substring(end);
      setFormData(prev => ({ ...prev, content: newText }));
    } else {
      const newText = formData.content.substring(0, start) + 
                     '**Bold text**' + 
                     formData.content.substring(end);
      setFormData(prev => ({ ...prev, content: newText }));
    }
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
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                  Content
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={insertBoldText}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <span>Bold</span>
                  </button>
                </div>
              </div>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts, experiences, or ask questions... 

Use **text** for bold formatting!"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Use **text** to make text bold. Example: **This will be bold**
              </p>
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
