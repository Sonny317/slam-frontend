import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from '../context/UserContext';

export default function MyPage() {
   const { user, updateUserImage } = useUser();
    
    const [userDetails, setUserDetails] = useState({
        name: "", bio: "", posts: [], comments: [], membership: null,
    });
    const [showQrCode, setShowQrCode] = useState(false);
    const qrCodeValue = JSON.stringify({ userId: userDetails.userId, name: userDetails.name });

    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user?.isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h1>
                    <p className="text-gray-600 mb-6">마이페이지를 이용하려면 로그인해주세요.</p>
                    <Link 
                        to="/login" 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        로그인하기
                    </Link>
                </div>
            </div>
        );
    }

    // ✅ user 상태가 변경될 때마다 userDetails를 업데이트합니다.
    useEffect(() => {
        if (user.isLoggedIn) {
            setUserDetails(prev => ({
                ...prev,
                name: user.name || 'Your Name',
                bio: user.bio || '자기소개를 작성해주세요.',
                membership: user.memberships && user.memberships.length > 0 
                    ? { 
                        branch: user.memberships.map(membership => {
                            // "ACTIVE_NCCU" 형태에서 지부 이름만 추출
                            return membership.includes('_') ? membership.split('_')[1] : membership;
                        }).join(', '), 
                        validUntil: "2025-12-31" 
                    } 
                    : null,
            }));
            
            // 사용자의 게시글과 댓글 데이터 가져오기
            fetchUserPosts();
            fetchUserComments();
        }
    }, [user]); // Context의 user 객체가 바뀔 때마다 실행

    // 사용자 게시글 가져오기
    const fetchUserPosts = async () => {
        try {
            const response = await axios.get('/api/users/me/posts');
            setUserDetails(prev => ({ ...prev, posts: response.data }));
        } catch (error) {
            console.error('Failed to fetch user posts:', error);
        }
    };

    // 사용자 댓글 가져오기
    const fetchUserComments = async () => {
        try {
            const response = await axios.get('/api/users/me/comments');
            setUserDetails(prev => ({ ...prev, comments: response.data }));
        } catch (error) {
            console.error('Failed to fetch user comments:', error);
        }
    };

    const handleImageSelectAndUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // ✅ sessionStorage -> localStorage 로 변경
        const currentEmail = localStorage.getItem("userEmail");
        if (!currentEmail) return alert("Login information not found.");

        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await axios.post("/api/users/profile/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Profile image updated successfully.");
            const newImagePath = response.data.profileImage;
            if (newImagePath) {
                updateUserImage(newImagePath);
            }
        } catch (error) {
            alert("Upload failed: " + (error.response?.data?.message || error.message));
        }
    };

    const handleBioSave = async () => {
        try {
            const response = await axios.post("/api/users/profile/bio", {
                bio: userDetails.bio,
            });
            alert("Bio saved successfully.");
            setUserDetails(prev => ({ ...prev, bio: response.data.bio }));
        } catch (error) {
            alert("Save failed: " + (error.response?.data || "An error occurred."));
        }
    };

    const handleBioChange = (e) => {
        setUserDetails(prevDetails => ({ ...prevDetails, bio: e.target.value }));
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">My Page</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="relative w-32 h-32 mx-auto">
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/default_profile.jpg"; }}
                                />
                                <label htmlFor="profile-upload" className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleImageSelectAndUpload} />
                                </label>
                            </div>
                            <h2 className="text-2xl font-bold mt-4">{userDetails.name || 'Your Name'}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <textarea
                                className="w-full border-none p-2 text-center text-sm mt-2 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 transition"
                                rows={3}
                                value={userDetails.bio}
                                onChange={handleBioChange}
                                placeholder="Write a short bio..."
                            />
                            <button onClick={handleBioSave} className="mt-2 w-full py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
                                Save Bio
                            </button>
                            <Link to="/change-password" className="mt-2 w-full inline-block text-center py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Change Password
                            </Link>
                        </div>
                        {userDetails.membership && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-xl text-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg">SLAM MEMBERSHIP</h3>
                                        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Logo" className="w-8 h-8 rounded-full" />
                                    </div>
                                    <p className="font-mono text-lg tracking-wider">{userDetails.name}</p>
                                    <div className="flex justify-between items-end mt-4 text-xs">
                                        <div>
                                            <p className="opacity-70">Branch</p>
                                            <p className="font-semibold">{userDetails.membership.branch}</p>
                                        </div>
                                        <div>
                                            <p className="opacity-70">Valid until</p>
                                            <p className="font-semibold">{userDetails.membership.validUntil}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    {showQrCode ? (
                                        <>
                                            <div className="p-4 bg-white inline-block rounded-lg shadow-inner">
                                                <QRCodeSVG value={qrCodeValue} size={180} />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3">Please show this to our staff at the event entrance.</p>
                                            <button onClick={() => setShowQrCode(false)} className="text-xs text-gray-500 mt-2 hover:underline">Hide QR Code</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setShowQrCode(true)} className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">
                                            Show Event Check-in Code
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">📌 My Posts</h2>
                            {userDetails.posts.length > 0 ? (
                                <ul className="space-y-3">
                                    {userDetails.posts.map((post) => (
                                        <li key={post.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                                            <Link to={`/community/${post.id}`} className="block">
                                                <p className="font-semibold text-blue-700 hover:text-blue-900">{post.title}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''} • {post.category}
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.summary || post.content}</p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4">아직 작성한 게시글이 없습니다.</p>
                            )}
                        </section>
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">💬 My Comments</h2>
                            {userDetails.comments.length > 0 ? (
                                <ul className="space-y-3">
                                    {userDetails.comments.map((comment) => (
                                        <li key={comment.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                                            <p className="italic text-gray-700">"{comment.text}"</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4">아직 작성한 댓글이 없습니다.</p>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}