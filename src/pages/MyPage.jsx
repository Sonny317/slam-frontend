import React, { useState, useEffect } from "react";

import axios from "../api/axios";

export default function MyPage() {
    const [userEmail, setUserEmail] = useState("");
    const [profileImage, setProfileImage] = useState("/default_profile.jpg");
    const [bio, setBio] = useState("");

    const [posts, setPosts] = useState([ { id: 1, title: "첫 번째 게시글", date: "2025-05-01" } ]);
    const [comments, setComments] = useState([ { id: 1, content: "좋은 정보 감사합니다!", postTitle: "첫 번째 게시글" } ]);

    const backendUrl = "http://localhost:8080";

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const storedImage = localStorage.getItem("profileImage");
        if (email) setUserEmail(email);
        
        if (storedImage) {
            setProfileImage(backendUrl + storedImage);
        }
    }, []);

    const handleImageSelectAndUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !userEmail) return;

        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("file", file);

        try {
            const response = await axios.post("/auth/upload-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("프로필 이미지가 성공적으로 변경되었습니다.");

            const newImagePath = response.data.profileImage;
            if (newImagePath) {
                setProfileImage(backendUrl + newImagePath);
                localStorage.setItem("profileImage", newImagePath);
                window.dispatchEvent(new Event("profileImageChanged"));
            }
        } catch (error) {
            alert("업로드 실패: " + (error.response?.data?.message || error.message));
        }
    };

    const handleBioSave = async () => {
        if (!userEmail) return alert("로그인 정보가 없어 저장할 수 없습니다.");
        try {
            await axios.post("/auth/profile/update", { email: userEmail, bio });
            alert("자기소개가 성공적으로 저장되었습니다.");
        } catch (error) {
            alert("저장 실패: " + error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* <MainHeader key={profileImage} /> ⬅️ 이 줄을 삭제했습니다. */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <h1 className="text-3xl font-bold mb-8 text-center">마이페이지</h1>
                <div className="bg-white p-8 rounded-lg shadow-md mb-10">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-4 w-full text-center">프로필 이미지</h2>
                            <div className="relative w-40 h-40">
                                <img
                                    src={profileImage}
                                    alt="프로필"
                                    className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/default_profile.jpg"; }}
                                />
                                <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-gray-700 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleImageSelectAndUpload}/>
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <h2 className="text-xl font-semibold mb-4">자기소개</h2>
                            <textarea
                                className="w-full border rounded p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 transition"
                                rows={8}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="자기소개를 입력하세요..."
                            />
                            <button onClick={handleBioSave} className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                                자기소개 저장
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
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
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">💬 내가 작성한 댓글</h2>
                        <ul className="space-y-3 text-sm">
                            {comments.map((comment) => (
                                <li key={comment.id} className="p-2 rounded hover:bg-gray-50 transition-colors">
                                    <p className="font-medium">"{comment.content}"</p>
                                    <p className="text-gray-500 text-xs mt-1"> - <span className="italic">{comment.postTitle}</span> 게시글에 작성</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
}