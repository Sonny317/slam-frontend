// src/pages/NewPostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Free-form');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill out both title and content.');
      return;
    }
    // TODO: 백엔드 API로 게시글 데이터 전송
    console.log({ title, content, category });
    alert('Post submitted successfully! (This is a demo)');
    navigate('/community');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option>Free-form</option>
            <option>Taipei Tips</option>
            <option>Travel Recs</option>
          </select>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            type="text" 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="What's on your mind?"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            className="w-full p-2 border rounded-md"
            placeholder="Share more details here..."
          ></textarea>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/community')} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
            Submit Post
          </button>
        </div>
      </form>
    </div>
  );
}
