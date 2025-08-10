// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { resolveAuthorsBatch } from '../api/auth';
import ShareMenu from '../components/ShareMenu';
import { useUser } from '../context/UserContext';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  // ✅ 고정 게시물 데이터
  const pinnedPosts = [
    {
      id: 101,
      category: 'Taipei Tips',
      title: "The Ultimate SLAM Guide to Taipei's Best Eats & Bars",
      author: "SLAM Staff",
      date: "2025-07-20",
      views: 999,
      isPinned: true,
      summary: "Don't know where to go? We've got you covered. Here's a curated list of our favorite spots in Taipei.",
      content: "Welcome to our comprehensive guide to Taipei's best dining and nightlife spots! This guide is curated by our SLAM team and includes our personal favorites."
    },
    {
      id: 102,
      category: 'Travel Recs',
      title: "AI-Planned: The Perfect 1-Night, 2-Day Trip to Yilan",
      author: "SLAM AI Assistant",
      date: "2025-07-19",
      views: 1250,
      isPinned: true,
      summary: "Pack your bags! Here is a ready-to-go itinerary for a refreshing weekend trip to Toucheng and Yilan, created by our AI.",
      content: "Ready for a weekend getaway? Our AI has planned the perfect trip to Yilan for you. This itinerary includes the best spots for food, nature, and relaxation."
    },
  ];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts/${postId}`);
        const data = response.data;
        // 작성자/댓글 작성자 아바타 매핑
        const authors = new Set();
        if (data?.author) authors.add(data.author);
        (data?.comments || []).forEach(c => c?.author && authors.add(c.author));
        let avatars = {};
        if (authors.size > 0) {
          try {
            const resolved = await resolveAuthorsBatch(Array.from(authors));
            avatars = resolved;
          } catch (_) {}
        }
        setPost({ ...data, _avatars: avatars });
      } catch (error) {
        console.error('Error loading post:', error);
        alert('Failed to load the post.');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // 좋아요 토글
  const handleLike = async () => {
    if (!user?.isLoggedIn) {
      alert('Login is required.');
      return;
    }
    
    try {
      const res = await axios.post(`/api/posts/${postId}/like`);
      const liked = !!res.data?.liked;
      setPost(prev => ({
        ...prev,
        likes: Math.max(0, (prev.likes || 0) + (liked ? 1 : -1)),
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('Failed to process like.');
    }
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!user?.isLoggedIn) {
      alert('Login is required.');
      return;
    }
    
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, {
        text: comment,
        author: user?.name || user?.email || 'Anonymous' // 사용자 이름을 우선으로, 없으면 이메일 사용
      });

      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));

      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        alert('Post deleted.');
        navigate('/community');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link 
            to="/community"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Community
          </Link>
        </div>

        {/* 게시글 카드 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 헤더 */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {post.category}
              </span>
              {post.isPinned && (
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  📌 SLAM Guide
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {post.title}
            </h1>
            
            {post.summary && (
              <p className="text-gray-600 text-lg mb-6">
                {post.summary}
              </p>
            )}

                         <div className="flex items-center justify-between text-sm text-gray-500">
               <div className="flex items-center space-x-4">
                  <Link to={`/users/profile?author=${encodeURIComponent(post.author)}`} className="flex items-center gap-2 hover:opacity-80">
                    <img src={(post._avatars?.[post.author]?.profileImage) || '/default_profile.jpg'} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    <span>by {post.author}</span>
                  </Link>
                 <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
               </div>
              <div className="flex items-center space-x-4">
                <span>👁️ {post.views} views</span>
                <span>❤️ {post.likes || 0} likes</span>
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>

          {/* 인터랙션 버튼 */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  disabled={!user?.isLoggedIn}
                  className={`flex items-center space-x-2 transition-colors ${
                    user?.isLoggedIn 
                      ? 'text-gray-500 hover:text-red-500' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title={!user?.isLoggedIn ? 'Login is required' : ''}
                >
                  <span>❤️</span>
                  <span>Like ({post.likes || 0})</span>
                </button>
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <span>💬</span>
                  <span>Comment ({(post.comments || []).length})</span>
                </button>
                <ShareMenu
                  title={post.title}
                  text={post.summary || post.content}
                  url={(typeof window !== 'undefined') ? window.location.href : ''}
                  variant="text"
                />
                {/* 관리자용 삭제 버튼 */}
                {user && user.role === 'ADMIN' && (
                  <button 
                    onClick={handleDeletePost}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                )}
              </div>
              
              <Link 
                to="/community"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Community
              </Link>
            </div>
          </div>

          {/* 댓글 섹션 */}
          {showComments && (
            <div className="px-8 py-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Comments ({(post.comments || []).length})</h3>
              
              {/* 댓글 목록 */}
              <div className="space-y-4 mb-6">
                {(post.comments || []).length > 0 ? (
                  (post.comments || []).map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/users/profile?author=${encodeURIComponent(comment.author)}`} className="flex items-center gap-2 hover:opacity-80">
                          <img src={(post._avatars?.[comment.author]?.profileImage) || '/default_profile.jpg'} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-medium text-gray-800">{comment.author}</span>
                        </Link>
                        <span className="text-sm text-gray-500">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* 댓글 작성 폼 */}
              <div className="border-t pt-4">
                {user?.isLoggedIn ? (
                  <>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Comment
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">Please log in to write a comment.</p>
                    <Link 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
