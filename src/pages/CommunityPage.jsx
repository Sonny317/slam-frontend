// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function CommunityPage() {
  const { user } = useUser();
  const [category, setCategory] = useState('Free-form');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['Free-form', 'Taipei Tips', 'Travel Recs'];

  // ✅ 백엔드에서 게시글 데이터를 가져옵니다
  useEffect(() => {
    let isMounted = true;
    
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/posts');
        if (isMounted) {
          setPosts(response.data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // 에러 발생 시 localStorage에서 가져오기 (fallback)
        try {
          const userPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
          if (isMounted) {
            setPosts(userPosts);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          if (isMounted) {
            setPosts([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = posts.filter(post => post.category === category);
  
  // 고정 게시물과 일반 게시물 분리
  const pinned = filteredPosts.filter(post => post.isPinned);
  const regular = filteredPosts.filter(post => !post.isPinned);

  // 게시글 삭제 핸들러
  const handleDeletePost = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Community</h1>
          {user?.isLoggedIn ? (
            <Link to="/community/new" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Write a Post
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm">게시글을 작성하려면 로그인이 필요합니다</span>
              <Link to="/login" className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                로그인
              </Link>
            </div>
          )}
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 고정 게시물을 먼저 보여줍니다. */}
            {pinned.map(post => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)}
            {/* 일반 게시물을 이어서 보여줍니다. */}
            {regular.map(post => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)}
          </div>
        )}
      </div>
    </div>
  );
}
