import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from '../context/UserContext';
import { calculateUserBadges, getNextBadgeProgress } from '../utils/badges';

export default function MyPage() {
   const { user, updateUserImage } = useUser();
    
    const [userDetails, setUserDetails] = useState({
        name: "", bio: "", posts: [], comments: [], membership: null,
        phone: "", major: "", studentId: "", interests: "", 
        spokenLanguages: "", desiredLanguages: "", badges: [], userStats: {}
    });
    const [showQrCode, setShowQrCode] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [showAllPosts, setShowAllPosts] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const qrCodeValue = JSON.stringify({ userId: userDetails.userId, name: userDetails.name });

    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user?.isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
                    <p className="text-gray-600 mb-6">Please log in to access your profile page.</p>
                    <Link 
                        to="/login" 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    // ✅ 멤버십 카드의 Valid Until 날짜 계산
    const calculateValidUntil = (branches) => {
        if (!branches || branches.length === 0) return "N/A";
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        
        // TAIPEI는 이벤트 당일만
        if (branches.includes('TAIPEI')) {
            return "Event Day Only";
        }
        
        // NCCU, NTU의 경우 학기별 계산
        if (branches.some(branch => ['NCCU', 'NTU'].includes(branch))) {
            // Fall Semester: 9-1월, Spring Semester: 2-6월
            if (currentMonth >= 9 || currentMonth === 1) {
                // Fall Semester
                const endYear = currentMonth === 1 ? now.getFullYear() : now.getFullYear() + 1;
                return `${endYear}-01-31 (Fall)`;
            } else if (currentMonth >= 2 && currentMonth <= 6) {
                // Spring Semester
                return `${now.getFullYear()}-06-30 (Spring)`;
            } else {
                // 7-8월은 다음 Fall Semester
                return `${now.getFullYear() + 1}-01-31 (Fall)`;
            }
        }
        
        return "N/A";
    };

    // ✅ 사용자의 실제 활성 지부 계산
    const getActiveBranches = (userData) => {
        const branches = [];
        
        // Admin/President는 모든 지부
        if (userData.role === 'ADMIN' || userData.role === 'PRESIDENT') {
            return ['NCCU', 'NTU', 'TAIPEI'];
        }
        
        // membership 필드에서 추출
        if (userData.membership) {
            branches.push(userData.membership);
        }
        
        // memberships 배열에서 활성 멤버십 추출
        if (userData.memberships && userData.memberships.length > 0) {
            userData.memberships.forEach(membership => {
                if (typeof membership === 'string') {
                    // "ACTIVE_NCCU" 형태에서 지부 이름만 추출
                    if (membership.includes('_')) {
                        const parts = membership.split('_');
                        if (parts[0] === 'ACTIVE') {
                            branches.push(parts[1]);
                        }
                    } else {
                        branches.push(membership);
                    }
                } else if (membership && membership.branchName) {
                    // 객체 형태의 멤버십
                    branches.push(membership.branchName);
                }
            });
        }
        
        // 중복 제거 및 반환
        return [...new Set(branches)];
    };

    // ✅ user 상태가 변경될 때마다 userDetails를 업데이트합니다.
    useEffect(() => {
        if (user.isLoggedIn) {
            // 서버에서 최신 정보 가져오기
            fetchUserData();
        }
    }, [user]); // Context의 user 객체가 바뀔 때마다 실행

    // 서버에서 사용자 정보 가져오기
    const fetchUserData = async () => {
        try {
            const response = await axios.get('/api/users/me');
            const userData = response.data;
            
            const activeBranches = getActiveBranches(userData);
            
            setUserDetails(prev => ({
                ...prev,
                name: userData.name || 'Your Name',
                bio: userData.bio || '자기소개를 작성해주세요.',
                phone: userData.phone || '',
                major: userData.major || '',
                studentId: userData.studentId || '',
                interests: userData.interests || '',
                spokenLanguages: userData.spokenLanguages || '',
                desiredLanguages: userData.desiredLanguages || '',
                membership: activeBranches.length > 0 
                    ? { 
                        branch: activeBranches.join(', '), 
                        validUntil: calculateValidUntil(activeBranches)
                    } 
                    : null,
            }));
            
            // 편집 폼 데이터도 초기화
            setEditFormData({
                name: userData.name || '',
                phone: userData.phone || '',
                major: userData.major || '',
                studentId: userData.studentId || '',
                bio: userData.bio || '',
                interests: userData.interests || '',
                spokenLanguages: userData.spokenLanguages || '',
                desiredLanguages: userData.desiredLanguages || ''
            });
            
            // 사용자의 게시글과 댓글 데이터 가져오기
            fetchUserPosts();
            fetchUserComments();
            
            // ✅ 사용자 통계 계산 및 뱃지 업데이트
            const userStats = {
                posts: userData.postCount || 0,
                comments: userData.commentCount || 0,
                likes: userData.totalLikes || 0,
                events: userData.eventCount || 0,
                membership: activeBranches.length > 0,
                membershipCount: userData.membershipCount || 0,
                trendingPosts: userData.trendingPosts || 0,
                helpfulReactions: userData.helpfulReactions || 0
            };
            
            const earnedBadges = calculateUserBadges(userStats);
            
            setUserDetails(prev => ({
                ...prev,
                badges: earnedBadges,
                userStats: userStats
            }));
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

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

    // ✅ 기본 정보 수정 함수들
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axios.post('/api/users/profile/update', editFormData);
            alert('Profile updated successfully!');
            
            // 사용자 정보 새로고침
            await fetchUserData();
            setShowEditForm(false);
        } catch (error) {
            alert('Failed to update profile: ' + (error.response?.data || error.message));
        }
    };

    const handleCancelEdit = () => {
        // 편집 취소 시 원래 데이터로 복원
        setEditFormData({
            name: userDetails.name,
            phone: userDetails.phone,
            major: userDetails.major,
            studentId: userDetails.studentId,
            bio: userDetails.bio,
            interests: userDetails.interests,
            spokenLanguages: userDetails.spokenLanguages,
            desiredLanguages: userDetails.desiredLanguages
        });
        setShowEditForm(false);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">My Page</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="relative w-32 h-32 mx-auto">
                                {/* ✅ 이니셜 아바타 */}
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                                    <span className="text-white text-4xl font-bold">
                                        {(userDetails.name || user.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <label htmlFor="profile-upload" className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleImageSelectAndUpload} />
                                </label>
                            </div>
                            <h2 className="text-2xl font-bold mt-4">{userDetails.name || 'Your Name'}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            
                            {/* 기본 정보 표시 */}
                            <div className="text-xs text-gray-600 mt-2 space-y-1">
                                {userDetails.phone && <p>📞 {userDetails.phone}</p>}
                                {userDetails.major && <p>🎓 {userDetails.major}</p>}
                                {userDetails.studentId && <p>🆔 {userDetails.studentId}</p>}
                            </div>
                            
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
                            
                            {/* 편집 버튼 */}
                            <button 
                                onClick={() => setShowEditForm(true)} 
                                className="mt-2 w-full py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Edit Profile
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
                        
                        {/* ✅ 뱃지/업적 섹션 */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🏆</span>
                                Achievements
                            </h3>
                            
                            {userDetails.badges && userDetails.badges.length > 0 ? (
                                <div className="space-y-3">
                                    {userDetails.badges.map((category, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => alert(`${category.name}\n\nCurrent Level: ${category.currentLevel}\nDescription: ${category.description}\n\nLevel Requirements:\n${category.levels.map((level, i) => `${i+1}. ${level.name}: ${level.description}`).join('\n')}`)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                    <span className="text-lg flex-shrink-0">{category.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm">{category.name}</h4>
                                                        <p className="text-xs text-gray-500 truncate">{category.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                        Level {category.currentLevel}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No achievements yet. Start participating to earn badges!</p>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">

                        {/* ✅ Posts 섹션 (접기/펼치기 기능) */}
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h2 className="text-xl font-semibold">📌 My Posts</h2>
                                {userDetails.posts.length > 3 && (
                                    <button
                                        onClick={() => setShowAllPosts(!showAllPosts)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <span>{showAllPosts ? 'Show Less' : `Show All (${userDetails.posts.length})`}</span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform ${showAllPosts ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {userDetails.posts.length > 0 ? (
                                <ul className="space-y-3">
                                    {(showAllPosts ? userDetails.posts : userDetails.posts.slice(0, 3)).map((post) => (
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
                                <p className="text-gray-500 text-center py-4">No posts yet.</p>
                            )}
                        </section>
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h2 className="text-xl font-semibold">💬 My Comments</h2>
                                {userDetails.comments.length > 3 && (
                                    <button
                                        onClick={() => setShowAllComments(!showAllComments)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <span>{showAllComments ? 'Show Less' : `Show All (${userDetails.comments.length})`}</span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform ${showAllComments ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {userDetails.comments.length > 0 ? (
                                <ul className="space-y-3">
                                    {(showAllComments ? userDetails.comments : userDetails.comments.slice(0, 3)).map((comment) => (
                                        <li key={comment.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                                            <p className="italic text-gray-700">"{comment.text}"</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No comments yet.</p>
                            )}
                        </section>
                    </div>
                </div>

                {/* 편집 모달 */}
                {showEditForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                            
                            <div className="space-y-4">
                                {/* 이름 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                
                                {/* 전화번호 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editFormData.phone || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="010-1234-5678"
                                    />
                                </div>
                                
                                {/* 전공 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                                    <input
                                        type="text"
                                        name="major"
                                        value={editFormData.major || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Computer Science"
                                    />
                                </div>
                                
                                {/* 학번 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={editFormData.studentId || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="110512345"
                                    />
                                </div>
                                
                                {/* 관심사 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                                    <input
                                        type="text"
                                        name="interests"
                                        value={editFormData.interests || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Music, Travel, Programming"
                                    />
                                </div>
                                
                                {/* 구사 언어 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Spoken Languages</label>
                                    <input
                                        type="text"
                                        name="spokenLanguages"
                                        value={editFormData.spokenLanguages || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Korean, English, Chinese"
                                    />
                                </div>
                                
                                {/* 배우고 싶은 언어 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Desired Languages</label>
                                    <input
                                        type="text"
                                        name="desiredLanguages"
                                        value={editFormData.desiredLanguages || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Japanese, Spanish"
                                    />
                                </div>
                                
                                {/* 자기소개 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={editFormData.bio || ''}
                                        onChange={handleEditFormChange}
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                            
                            {/* 버튼들 */}
                            <div className="flex gap-3 mt-6">
                                <button 
                                    onClick={handleCancelEdit}
                                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveProfile}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}