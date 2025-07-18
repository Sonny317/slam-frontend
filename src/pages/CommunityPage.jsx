// src/pages/CommunityPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockPosts } from '../data/mockPosts';
import PostCard from '../components/PostCard'; // ✅ 새로 만든 PostCard 컴포넌트를 불러옵니다.

export default function CommunityPage() {
  const [category, setCategory] = useState('Free-form');
  const categories = ['Free-form', 'Taipei Tips', 'Travel Recs'];

  const filteredPosts = mockPosts.filter(post => post.category === category);
  
  // 고정 게시물과 일반 게시물 분리
  const pinned = filteredPosts.filter(post => post.isPinned);
  const regular = filteredPosts.filter(post => !post.isPinned);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Community</h1>
          <Link to="/community/new" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Write a Post
          </Link>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex gap-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  category === cat 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
        
        {/* ✅ 카드 레이아웃으로 변경 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 고정 게시물을 먼저 보여줍니다. */}
          {pinned.map(post => <PostCard key={post.id} post={post} />)}
          {/* 일반 게시물을 이어서 보여줍니다. */}
          {regular.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
    </div>
  );
}
