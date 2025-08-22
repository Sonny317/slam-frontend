import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { calculateUserBadges, getNextBadgeProgress } from '../utils/badges';

export default function UserProfilePage() {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const authorParam = searchParams.get('author');
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                
                // userId 또는 author parameter로 프로필 조회
                let response;
                if (userId) {
                    response = await axios.get(`/api/users/profile/${userId}`);
                } else if (authorParam) {
                    response = await axios.get(`/api/users/profile/by-name/${encodeURIComponent(authorParam)}`);
                } else {
                    throw new Error('No user identifier provided');
                }
                
                const userData = response.data;
                
                // 사용자 통계 계산
                const userStats = {
                    posts: userData.postCount || 0,
                    comments: userData.commentCount || 0,
                    likes: userData.totalLikes || 0,
                    events: userData.eventCount || 0,
                    membership: userData.membership !== null,
                    membershipDuration: userData.membershipDuration || 0,
                    trendingPosts: userData.trendingPosts || 0,
                    helpfulReactions: userData.helpfulReactions || 0
                };
                
                const earnedBadges = calculateUserBadges(userStats);
                
                setUserProfile({
                    ...userData,
                    badges: earnedBadges,
                    userStats: userStats
                });
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                
                // ✅ API 실패 시 기본 사용자 데이터 생성
                const fallbackUserData = {
                    name: authorParam || 'Anonymous User',
                    bio: 'This user profile is not available.',
                    major: null,
                    interests: null,
                    spokenLanguages: null,
                    membership: null,
                    posts: [],
                    comments: [],
                    postCount: 0,
                    commentCount: 0,
                    totalLikes: 0,
                    eventCount: 0,
                    membershipCount: 0,
                    trendingPosts: 0,
                    helpfulReactions: 0
                };
                
                const userStats = {
                    posts: 0,
                    comments: 0,
                    likes: 0,
                    events: 0,
                    membership: false,
                    membershipCount: 0,
                    trendingPosts: 0,
                    helpfulReactions: 0
                };
                
                const earnedBadges = calculateUserBadges(userStats);
                
                setUserProfile({
                    ...fallbackUserData,
                    badges: earnedBadges,
                    userStats: userStats
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId || authorParam) {
            fetchUserProfile();
        }
    }, [userId, authorParam]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
                    <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
                    <Link 
                        to="/community" 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Community
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        {/* 프로필 카드 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-24 h-24 mx-auto mb-4">
                                {/* 이니셜 아바타 */}
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                                    <span className="text-white text-2xl font-bold">
                                        {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold">{userProfile.name || 'Anonymous User'}</h2>
                            {/* ✅ 이메일 숨김 - 표시하지 않음 */}
                            
                            {/* 기본 정보 (공개 정보만) */}
                            <div className="text-xs text-gray-600 mt-3 space-y-1">
                                {userProfile.major && <p>🎓 {userProfile.major}</p>}
                                {userProfile.interests && <p>💫 {userProfile.interests}</p>}
                                {userProfile.spokenLanguages && <p>🗣️ {userProfile.spokenLanguages}</p>}
                            </div>
                            
                            {userProfile.bio && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-700">{userProfile.bio}</p>
                                </div>
                            )}
                            
                            {/* 멤버십 정보 */}
                            {userProfile.membership && (
                                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">
                                        🏅 SLAM Member
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {userProfile.membership}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ✅ 뱃지/업적 섹션 */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🏆</span>
                                Achievements
                            </h3>
                            
                            {userProfile.badges && userProfile.badges.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {userProfile.badges.map((badge, index) => (
                                        <div key={index} className={`${badge.color} px-3 py-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity`} onClick={() => alert(`${badge.name}\n\nCurrent Level: ${badge.currentLevel}\nDescription: ${badge.description}\n\nLevel Requirements:\n${badge.levels.map((level, i) => `${i+1}. ${level.name}: ${level.description}`).join('\n')}`)}>
                                            <span className="text-lg">{badge.icon}</span>
                                            <div>
                                                <p className="font-semibold text-sm">{badge.name} (Level {badge.currentLevel})</p>
                                                <p className="text-xs opacity-75">{badge.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No achievements yet.</p>
                            )}
                        </div>


                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* 최근 게시글 */}
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
                                <span className="mr-2">📌</span>
                                Recent Posts
                            </h2>
                            {userProfile.posts && userProfile.posts.length > 0 ? (
                                <ul className="space-y-3">
                                    {userProfile.posts.slice(0, 5).map((post) => (
                                        <li key={post.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                                            <Link to={`/community/post/${post.id}`} className="block">
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
                                <p className="text-gray-500 text-center py-8">No posts yet.</p>
                            )}
                        </section>

                        {/* 최근 활동 */}
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
                                <span className="mr-2">💬</span>
                                Recent Activity
                            </h2>
                            {userProfile.comments && userProfile.comments.length > 0 ? (
                                <ul className="space-y-3">
                                    {userProfile.comments.slice(0, 5).map((comment) => (
                                        <li key={comment.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors">
                                            <p className="italic text-gray-700">"{comment.text}"</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No recent activity.</p>
                            )}
                        </section>
                    </div>
                </div>

                {/* 뒤로가기 버튼 */}
                <div className="mt-8 text-center">
                    <Link 
                        to="/community"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Community
                    </Link>
                </div>
            </main>
        </div>
    );
}