// src/components/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from '../api/axios';
import { resolveAuthorsBatch } from '../api/auth';
import ShareMenu from './ShareMenu';

// --- Placeholder Icons ---
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
);
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m5.632 5.684C14.114 15.062 15 13.574 15 12s-.886-3.062-1.316-4.342m0 8.684a7.5 7.5 0 100-8.684" /></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function PostCard({ post, onDelete }) {
  const { user } = useUser();
  // 고정 게시물은 특별한 스타일을 적용합니다.
  const isPinned = post.isPinned;
  const [likeCount, setLikeCount] = React.useState(post.likes || 0);
  const [liked, setLiked] = React.useState(false);
  const [avatars, setAvatars] = React.useState({});

  React.useEffect(() => {
    (async () => {
      try {
        const authors = [post.author];
        const data = await resolveAuthorsBatch(authors);
        setAvatars(data || {});
      } catch (_) {}
    })();
  }, [post.author]);
  
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${post.id}`);
        if (onDelete) {
          onDelete(post.id);
        }
        alert('Post deleted.');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md flex flex-col transition-all duration-300 hover:shadow-xl ${isPinned && 'ring-2 ring-blue-500'}`}>
      {/* 고정 게시물일 경우 뱃지 표시 */}
      {isPinned && (
        <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-tl-lg rounded-br-lg absolute z-10">
          📌 SLAM Guide
        </div>
      )}

      {/* 게시물 내용 (클릭 시 상세 페이지로 이동) */}
      <Link to={`/community/${post.id}`} className="flex-grow p-6">
        <p className="text-sm text-gray-500 mb-2">{post.category}</p>
        <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600">{post.title}</h2>
        <p className="text-gray-600 text-sm line-clamp-3">{post.summary || post.content}</p>
      </Link>

      {/* 작성자 정보 및 인터랙션 버튼 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link to={`/users/profile?author=${encodeURIComponent(post.author)}`} className="flex items-center gap-2 hover:opacity-80">
            <img src={(avatars?.[post.author]?.profileImage) || '/default_profile.jpg'} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
            <span>by {post.author}</span>
          </Link>
        </div>
        <div className="flex gap-4 text-gray-500">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user?.isLoggedIn) {
                alert('Login is required.');
                return;
              }
              // 좋아요 토글 호출
              (async () => {
                try {
                  const res = await axios.post(`/api/posts/${post.id}/like`);
                  const nowLiked = !!res.data?.liked;
                  setLiked(nowLiked);
                  setLikeCount((prev) => prev + (nowLiked ? 1 : -1));
                } catch (err) {
                  const msg = err?.response?.data || err.message || 'Failed to toggle like';
                  alert(msg);
                }
              })();
            }}
            disabled={!user?.isLoggedIn}
            className={`flex items-center gap-1 transition-colors ${
              user?.isLoggedIn ? 'hover:text-red-500' : 'cursor-not-allowed opacity-50'
            }`}
            title={!user?.isLoggedIn ? 'Login is required' : ''}
          >
            <HeartIcon />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <CommentIcon />
            <span>{post.comments?.length || 0}</span>
          </div>
          <ShareMenu
            title={post.title}
            text={post.summary || post.content}
            url={(typeof window !== 'undefined') ? `${window.location.origin}/community/${post.id}` : ''}
            variant="icon"
          />
          {/* 관리자용 삭제 버튼 */}
          {user && user.role === 'ADMIN' && (
            <button 
              onClick={handleDelete}
              className="hover:text-red-500 transition-colors"
              title="게시글 삭제"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}