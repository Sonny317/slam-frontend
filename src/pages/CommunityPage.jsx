// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

// Dcard 스타일 포스트 카드 컴포넌트
const DcardPostCard = ({ post, onDelete, isPinned }) => {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${post.id}`);
        onDelete(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer relative ${isPinned ? 'ring-2 ring-blue-200' : ''}`}>
      {/* Pinned Badge */}
      {isPinned && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <span>📌</span>
          <span>Pinned</span>
        </div>
      )}

      {/* Menu Button */}
      {user?.isLoggedIn && (user.email === post.author || user.role === 'ADMIN') && (
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Link to={`/community/post/${post.id}`} className="block p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {post.profileImage ? (
              <img 
                src={post.profileImage} 
                alt={`${post.author}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold ${post.profileImage ? 'hidden' : ''}`}>
              {post.author?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author || 'Anonymous'}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTimeAgo(post.createdAt)}</span>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{post.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-3">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button className="hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function CommunityPage() {
  const { user } = useUser();
  const [category, setCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  const categories = [
    { id: 'All', name: 'All Posts', icon: '🏠', count: 0 },
    { id: 'Free-form', name: 'Free Talk', icon: '💬', count: 0 },
    { id: 'Taipei Tips', name: 'Taipei Tips', icon: '🏙️', count: 0 },
    { id: 'Travel Recs', name: 'Travel', icon: '✈️', count: 0 },
    { id: 'Food & Drink', name: 'Food & Drink', icon: '🍕', count: 0 },
    { id: 'Language Exchange', name: 'Language', icon: '🗣️', count: 0 },
    { id: 'Events', name: 'Events', icon: '🎉', count: 0 }
  ];

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // 게시글 필터링 및 검색
  const filteredPosts = posts.filter(post => {
    const matchesCategory = category === 'All' || post.category === category;
    const matchesSearch = searchTerm === '' || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // 고정 게시물과 일반 게시물 분리
  const pinned = filteredPosts.filter(post => post.isPinned);
  const regular = filteredPosts.filter(post => !post.isPinned).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 카테고리별 게시글 수 계산
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: cat.id === 'All' ? posts.length : posts.filter(post => post.category === cat.id).length
  }));

  // 게시글 삭제 핸들러
  const handleDeletePost = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Community</h1>
              
              {/* Search Bar - Desktop only (same row as Community) */}
              {isDesktop && (
                <div className="relative ml-8">
                  <input
                    type="text"
                    placeholder="Search posts, topics, or members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Write Post Button - Only show on mobile/tablet */}
            {!isDesktop && (
              <>
                {user?.isLoggedIn ? (
                  <Link to="/community/new" className="bg-blue-600 text-white font-medium py-2 px-3 md:px-4 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-1 md:space-x-2 flex-shrink-0 ml-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:block">Write</span>
                  </Link>
                ) : (
                  <Link to="/login" className="bg-gray-500 text-white font-medium py-2 px-3 md:px-4 rounded-full hover:bg-gray-600 transition-colors text-sm md:text-base flex-shrink-0 ml-4">
                    <span className="hidden sm:block">Log in to post</span>
                    <span className="block sm:hidden">Login</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile/Tablet only (centered) */}
      {!isDesktop && (
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts, topics, or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Category Filter */}
      {!isDesktop && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {categoriesWithCount.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Categories (Desktop only) */}
        {isDesktop && (
          <div className="w-72 bg-white border-r border-gray-200 min-h-screen sticky top-16">
            <div className="p-6">
              {/* User Profile Section */}
              {user?.isLoggedIn && (
                <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={`${user.name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg ${user.profileImage ? 'hidden' : ''}`}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name || 'User'}</h3>
                      <p className="text-sm text-gray-600">{user.membership || 'Member'}</p>
                    </div>
                  </div>
                  <Link to="/community/new" className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Write New Post</span>
                  </Link>
                </div>
              )}

              {/* Categories Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Browse Categories</h2>
                <nav className="space-y-1">
                  {categoriesWithCount.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        category === cat.id 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-xl transition-transform group-hover:scale-110 ${
                          category === cat.id ? 'text-white' : ''
                        }`}>
                          {cat.icon}
                        </span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        category === cat.id 
                          ? 'bg-blue-400 text-white' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Popular Tags Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['study-tips', 'food-review', 'meetup', 'language-exchange', 'travel', 'apartment'].map(tag => (
                    <button
                      key={tag}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Quick Links</h3>
                <Link to="/events" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <span>🎉</span>
                  <span>Upcoming Events</span>
                </Link>
                <Link to="/membership" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <span>🎫</span>
                  <span>Membership</span>
                </Link>
                <Link to="/brand-story" className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <span>📖</span>
                  <span>About SLAM</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Right Content - Posts Feed */}
        <div className="flex-1 bg-gray-50">
          <div className="max-w-2xl mx-auto p-4 md:p-6">
            {/* Trending/Popular section */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4 overflow-x-auto pb-2">
                <button className="flex-shrink-0 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  🔥 Trending
                </button>
                <button className="flex-shrink-0 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  ⏰ Latest
                </button>
                <button className="flex-shrink-0 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  💬 Most Discussed
                </button>
                <button className="flex-shrink-0 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  ❤️ Most Liked
                </button>
              </div>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pinned Posts */}
                {pinned.map(post => (
                  <DcardPostCard key={post.id} post={post} onDelete={handleDeletePost} isPinned={true} />
                ))}
                
                {/* Regular Posts */}
                {regular.map(post => (
                  <DcardPostCard key={post.id} post={post} onDelete={handleDeletePost} isPinned={false} />
                ))}
                
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">🔍</div>
                    <p className="text-gray-500">No posts found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
