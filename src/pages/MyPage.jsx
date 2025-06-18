import React, { useState } from "react";
import MainHeader from "../components/MainHeader";

export default function MyPage() {
  const [profileImage, setProfileImage] = useState("/default_profile.jpg");
  const [bio, setBio] = useState("안녕하세요! SLAM 멤버입니다.");
  const [posts, setPosts] = useState([
    { id: 1, title: "첫 번째 게시글", date: "2025-05-01" },
    { id: 2, title: "언어교환 팁 공유", date: "2025-05-12" },
  ]);
  const [comments, setComments] = useState([
    { id: 1, content: "좋은 정보 감사합니다!", postTitle: "첫 번째 게시글" },
    { id: 2, content: "정말 유용했어요!", postTitle: "언어교환 팁 공유" },
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setProfileImage(previewURL);
      // 백엔드 업로드 연동 가능
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <MainHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">마이페이지</h1>

        {/* 프로필 정보 */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-10">
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <div className="relative w-32 h-32">
              <img
                src={profileImage}
                alt="프로필"
                className="w-full h-full rounded-full object-cover border-2 border-gray-200"
              />
              <label className="absolute bottom-1 right-1 bg-gray-200 p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <textarea
                className="w-full border rounded p-3 text-sm mt-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자기소개를 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* 활동 내역 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* 게시글 섹션 */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">📌 내가 작성한 게시글</h2>
            <ul className="space-y-3 text-sm">
              {posts.map((post) => (
                <li key={post.id} className="p-2 rounded hover:bg-gray-50 transition-colors">
                  {post.title} <span className="text-gray-500 text-xs">({post.date})</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 댓글 섹션 */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">💬 내가 작성한 댓글</h2>
            <ul className="space-y-3 text-sm">
              {comments.map((comment) => (
                <li key={comment.id} className="p-2 rounded hover:bg-gray-50 transition-colors">
                  <p className="font-medium">"{comment.content}"</p>
                  <p className="text-gray-500 text-xs mt-1">
                    - <span className="italic">{comment.postTitle}</span> 게시글에 작성
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}