// src/pages/PostDetailPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockPosts } from '../data/mockPosts';

export default function PostDetailPage() {
  const { postId } = useParams();
  const post = mockPosts.find(p => p.id === parseInt(postId));

  if (!post) {
    return <div className="text-center py-20">Post not found.</div>;
  }

  // ✅ 댓글이 없는 경우를 대비해 빈 배열을 기본값으로 설정합니다.
  const comments = post.comments || [];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Post Header */}
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
              <span>Posted by <strong>{post.author}</strong></span>
              <span>on {post.date}</span>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="prose max-w-none text-lg text-gray-800 leading-relaxed mb-10">
            {post.content}
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Comments ({comments.length})</h2>
            
            {/* ✅ 중복 코드를 제거하고, 안전하게 댓글 목록을 보여줍니다. */}
            <div className="space-y-4 mb-6">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="bg-gray-100 p-4 rounded-md">
                    <p className="font-semibold">{comment.author}</p>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Be the first to comment!</p>
              )}
            </div>

            {/* New Comment Form */}
            <div className="mt-6">
              <textarea 
                className="w-full p-3 border rounded-md"
                rows="3"
                placeholder="Write a comment..."
              ></textarea>
              <button className="mt-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Submit Comment
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link to="/community" className="text-blue-600 hover:underline">&larr; Back to Community</Link>
        </div>
      </div>
    </div>
  );
}
