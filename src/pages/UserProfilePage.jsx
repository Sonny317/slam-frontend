import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function UserProfilePage() {
  const { userId: userIdParam } = useParams();
  const query = useQuery();
  const author = query.get('author');

  const [userId, setUserId] = useState(userIdParam || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveAndFetch = async () => {
      try {
        setLoading(true);
        let id = userIdParam;
        if (!id && author) {
          const res = await axios.get('/api/users/resolve', { params: { author } });
          if (res.data?.found) {
            id = String(res.data.userId);
            setUserId(id);
          } else {
            setData({ notFound: true });
            return;
          }
        }
        if (!id) return;
        const profile = await axios.get(`/api/users/${id}`);
        setData(profile.data);
      } catch (err) {
        setData({ notFound: true });
      } finally {
        setLoading(false);
      }
    };
    resolveAndFetch();
  }, [userIdParam, author]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!data || data.notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found.</p>
          <Link to="/community" className="text-blue-600 hover:text-blue-800">Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4">
            <img src={data.profileImage || '/default_profile.jpg'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
              <p className="text-sm text-gray-500">{data.email}</p>
            </div>
          </div>
          {data.bio && (
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{data.bio}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Posts</h2>
            {data.posts?.length ? (
              <ul className="space-y-3">
                {data.posts.map(p => (
                  <li key={p.id} className="p-3 rounded-md hover:bg-gray-50">
                    <Link to={`/community/post/${p.id}`} className="block">
                      <p className="font-semibold text-blue-700 hover:text-blue-900">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''} • {p.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{p.summary || p.content}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No posts yet.</p>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            {data.comments?.length ? (
              <ul className="space-y-3">
                {data.comments.map(c => (
                  <li key={c.id} className="p-3 rounded-md hover:bg-gray-50">
                    <p className="text-sm text-gray-700">{c.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/community" className="text-blue-600 hover:text-blue-800">← Back to Community</Link>
        </div>
      </div>
    </div>
  );
}


