import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from '../context/UserContext';
import { calculateUserBadges, getNextBadgeProgress, BADGE_CATEGORIES } from '../utils/badges';

// ✅ 드롭다운 옵션들 정의
const STATUS_OPTIONS = {
  NCCU: ["Student"],
  NTU: ["Student"],
  TAIPEI: ["Student", "Professional", "Business Owner", "Freelancer", "Intern"]
};

// ✅ Taipei 멤버십 세부 산업 카테고리 (MembershipPage와 동일)
const INDUSTRY_CATEGORIES = [
  "Design & Creative",
  "Education & Research",
  "Finance & Banking", 
  "Food & Beverage",
  "Government & Public Service",
  "Healthcare & Medical",
  "Legal & Consulting",
  "Manufacturing",
  "Marketing & Advertising",
  "Media & Communications",
  "Non-profit & NGO",
  "Real Estate",
  "Retail & E-commerce",
  "Technology & Software",
  "Others"
];

// ✅ 통합 대분류 - 모든 학교에서 사용 가능한 표준화된 전공 카테고리 (알파벳 순)
const unifiedMajors = [
  "Agriculture & Life Sciences",
  "Architecture & Planning",
  "Business & Management", 
  "Communication & Media Studies",
  "Computer Science & Information Technology",
  "Design & Arts",
  "Economics & Finance",
  "Education & Teaching",
  "Engineering & Technology",
  "Environmental Studies",
  "Languages & Linguistics", 
  "Law & Legal Studies",
  "Liberal Arts & Humanities",
  "Medicine & Health Sciences",
  "Music & Performing Arts",
  "Philosophy & Religious Studies",
  "Political Science & International Relations",
  "Public Health & Social Work",
  "Science & Mathematics",
  "Social Sciences & Psychology",
  "Sports & Physical Education",
  "Others"
];

const INTERESTS_OPTIONS = [
  "Art", "Books", "Business", "Cooking", "Culture", "Dance", "Environment", "Fashion", 
  "Fitness", "Food", "Gaming", "History", "Languages", "Movies", "Music", "Nature", 
  "Photography", "Politics", "Programming", "Reading", "Science", "Sports", "Technology", "Travel"
];

const MBTI_OPTIONS = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
];

const LANGUAGE_OPTIONS = [
  "Arabic", "Chinese", "Dutch", "English", "French", "German", 
  "Hindi", "Indonesian", "Italian", "Japanese", "Korean", "Malay", "Norwegian", "Portuguese", 
  "Russian", "Spanish", "Swedish", "Tagalog", "Thai", "Vietnamese", "Others"
];

export default function MyPage() {
   const { user, updateUserImage } = useUser();
    
    const [userDetails, setUserDetails] = useState({
        name: "", bio: "", posts: [], comments: [], membership: null,
        phone: "", major: "", studentId: "", interests: [],
        spokenLanguages: [], desiredLanguages: [], mbti: "", status: "", 
        industry: "", networkingGoal: "", otherNetworkingGoal: "", badges: [], userStats: {}
    });
    const [showQrCode, setShowQrCode] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        detailedMajor: '',
        otherMajor: '',
        otherNetworkingGoal: ''
    });
    const [showAllPosts, setShowAllPosts] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [studentIdEditCount, setStudentIdEditCount] = useState(0); // 학번 수정 횟수 제한
    // ✅ Others 언어 입력을 위한 상태
    const [otherSpokenLanguage, setOtherSpokenLanguage] = useState('');
    const [otherDesiredLanguage, setOtherDesiredLanguage] = useState('');
    // ✅ 벳지 상세 정보 모달 상태
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [selectedBadgeLevel, setSelectedBadgeLevel] = useState(0);
    // ✅ 화면 크기 감지를 위한 상태
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    // ✅ QR 코드 관련 상태 추가
    const [availableEvents, setAvailableEvents] = useState([]);
    const [selectedEventForQr, setSelectedEventForQr] = useState(null);
    
    // 선택된 이벤트에 대한 QR 코드 값 생성
    const qrCodeValue = selectedEventForQr 
        ? JSON.stringify({ 
            userId: userDetails.userId, 
            name: userDetails.name, 
            eventId: selectedEventForQr.id 
          })
        : JSON.stringify({ 
            userId: userDetails.userId, 
            name: userDetails.name 
          });

    // ✅ 디버깅: QR 코드 값 로그
    console.log('QR Code Debug Info:', {
        userDetails: userDetails,
        selectedEventForQr: selectedEventForQr,
        qrCodeValue: qrCodeValue,
        parsedQrCode: qrCodeValue ? JSON.parse(qrCodeValue) : null
    });

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

    // ✅ 화면 크기 감지 useEffect
    useEffect(() => {
        const handleResize = () => {
            const newIsLargeScreen = window.innerWidth >= 1024;
            setIsLargeScreen(newIsLargeScreen);
        };

        // 초기 화면 크기 설정
        handleResize();

        // 리사이즈 이벤트 리스너 추가
        window.addEventListener('resize', handleResize);

        // 클린업
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ✅ 사용 가능한 이벤트 목록 로드
    useEffect(() => {
        const loadAvailableEvents = async () => {
            try {
                const response = await axios.get('/api/events');
                const events = response.data || [];
                // 현재 날짜 이후의 이벤트만 필터링
                const now = new Date();
                const upcomingEvents = events.filter(event => 
                    new Date(event.eventDateTime) >= now
                );
                setAvailableEvents(upcomingEvents);
            } catch (error) {
                console.error('Failed to load events:', error);
                setAvailableEvents([]);
            }
        };

        if (user.isLoggedIn) {
            loadAvailableEvents();
        }
    }, [user.isLoggedIn]);

    // ✅ user 상태가 변경될 때마다 userDetails를 업데이트합니다.
    useEffect(() => {
        if (user.isLoggedIn) {
            // 서버에서 최신 정보 가져오기
            fetchUserData();
        }
    }, [user]); // Context의 user 객체가 바뀔 때마다 실행

    // ✅ 사용자 정보를 가져올 때 멤버십 정보도 함께 가져오기 (Single Source of Truth)
    const fetchUserData = async () => {
        try {
            // 1. 기본 사용자 정보 가져오기
            const response = await axios.get('/api/users/me');
            const userData = response.data;
            
            // 2. 멤버십 신청 정보 가져오기 (있다면)
            let membershipData = null;
            try {
                const membershipResponse = await axios.get('/api/memberships/my-application');
                membershipData = membershipResponse.data;
                console.log('Membership application found:', membershipData);
            } catch (error) {
                // 멤버십 신청 정보가 없는 경우 (아직 신청하지 않음)
                if (error.response?.status === 404) {
                    console.log('No membership application found - user has not applied yet');
                } else {
                    console.error('Error fetching membership application:', error.response?.status, error.response?.data);
                }
            }
            
            const activeBranches = getActiveBranches(userData);

            // ✅ 배열 형태의 데이터를 문자열로 변환 (기존 호환성)
            const interests = Array.isArray(userData.interests) ? userData.interests :
                            (userData.interests ? userData.interests.split(',').map(s => s.trim()) : []);
            const spokenLanguages = Array.isArray(userData.spokenLanguages) ? userData.spokenLanguages :
                                  (userData.spokenLanguages ? userData.spokenLanguages.split(',').map(s => s.trim()) : []);
            const desiredLanguages = Array.isArray(userData.desiredLanguages) ? userData.desiredLanguages :
                                   (userData.desiredLanguages ? userData.desiredLanguages.split(',').map(s => s.trim()) : []);

            // ✅ 멤버십 정보와 사용자 정보를 통합 (Single Source of Truth)
            // 우선순위: 멤버십 신청 정보 > 기존 사용자 정보
            const integratedUserData = {
                userId: userData.userId, // ✅ userId 추가 (userData.id가 아니라 userData.userId)
                name: membershipData?.name || userData.name || 'Your Name',
                phone: membershipData?.phone || userData.phone || '',
                major: membershipData?.major || userData.major || '',
                studentId: membershipData?.studentId || userData.studentId || '',
                status: membershipData?.professionalStatus || userData.status || 
                       (activeBranches.includes('TAIPEI') ? 'Professional' : 'Student'),
                interests: interests,
                spokenLanguages: spokenLanguages,
                desiredLanguages: desiredLanguages,
                mbti: userData.mbti || '',
                bio: userData.bio || 'Tell us about yourself...',
                industry: membershipData?.industry || userData.industry || '',
                networkingGoal: membershipData?.networkingGoal || userData.networkingGoal || '',
                otherNetworkingGoal: membershipData?.otherNetworkingGoal || userData.otherNetworkingGoal || ''
            };
            
            setUserDetails(prev => ({
                ...prev,
                ...integratedUserData,
                membership: activeBranches.length > 0 
                    ? { 
                        branch: activeBranches.join(', '), 
                        validUntil: calculateValidUntil(activeBranches)
                    } 
                    : null,
            }));
            
            // 편집 폼 데이터도 통합된 정보로 초기화
            setEditFormData({
                name: integratedUserData.name,
                phone: integratedUserData.phone,
                major: integratedUserData.major,
                detailedMajor: integratedUserData.detailedMajor || '',
                otherMajor: integratedUserData.otherMajor || '',
                studentId: integratedUserData.studentId,
                bio: integratedUserData.bio,
                interests: integratedUserData.interests,
                spokenLanguages: integratedUserData.spokenLanguages,
                desiredLanguages: integratedUserData.desiredLanguages,
                mbti: integratedUserData.mbti,
                status: integratedUserData.status,
                industry: integratedUserData.industry || '',
                networkingGoal: integratedUserData.networkingGoal || '',
                otherNetworkingGoal: integratedUserData.otherNetworkingGoal || ''
            });

            // 학번 수정 횟수 설정
            setStudentIdEditCount(userData.studentIdEditCount || 0);
            
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

    // ✅ 기본 정보 수정 함수들
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ 태그 선택/해제 함수들
    const handleTagToggle = (field, value) => {
        setEditFormData(prev => {
            if (field === 'mbti') {
                // MBTI는 단일 선택
                return { ...prev, [field]: prev[field] === value ? '' : value };
            } else {
                // 다른 태그들은 다중 선택
                const currentTags = prev[field] || [];
                const newTags = currentTags.includes(value)
                    ? currentTags.filter(tag => tag !== value)
                    : [...currentTags, value];
                return { ...prev, [field]: newTags };
            }
        });
    };

    // ✅ Others 언어 추가 함수
    const handleAddOtherLanguage = (field, otherValue, setOtherValue) => {
        if (otherValue.trim()) {
            setEditFormData(prev => {
                const currentTags = prev[field] || [];
                if (!currentTags.includes(otherValue.trim())) {
                    return { ...prev, [field]: [...currentTags, otherValue.trim()] };
                }
                return prev;
            });
            setOtherValue('');
        }
    };

    // ✅ 벳지 상세 정보 표시 함수
    const showBadgeDetails = (badge, currentLevel) => {
        setSelectedBadge(badge);
        setSelectedBadgeLevel(currentLevel);
        setShowBadgeModal(true);
    };

    // ✅ 프로필 저장 시 멤버십 정보도 함께 업데이트 (Single Source of Truth)
    const handleSaveProfile = async () => {
        try {
            // ✅ 학번 수정 횟수 체크
            if (editFormData.studentId !== userDetails.studentId && studentIdEditCount >= 1) {
                alert('Student ID can only be changed once. You have already used your chance.');
                return;
            }

            // ✅ 배열 데이터를 문자열로 변환하여 전송
            const dataToSend = {
                ...editFormData,
                interests: editFormData.interests.join(', '),
                spokenLanguages: editFormData.spokenLanguages.join(', '),
                desiredLanguages: editFormData.desiredLanguages.join(', '),
                studentIdEditCount: editFormData.studentId !== userDetails.studentId ? studentIdEditCount + 1 : studentIdEditCount
            };

            // 1. 사용자 프로필 업데이트 (메인 데이터)
            await axios.post('/api/users/profile/update', dataToSend);

            // 2. 멤버십 정보가 있다면 함께 업데이트 (데이터 일관성 유지)
            if (userDetails.membership) {
                try {
                    const membershipUpdateData = {
                        name: editFormData.name,
                        phone: editFormData.phone,
                        major: editFormData.major,
                        studentId: editFormData.studentId,
                        professionalStatus: editFormData.status,
                        industry: editFormData.industry,
                        networkingGoal: editFormData.networkingGoal,
                        otherNetworkingGoal: editFormData.otherNetworkingGoal
                    };
                    
                    await axios.put('/api/memberships/update-profile', membershipUpdateData);
                } catch (error) {
                    console.log('Membership profile update not available or not needed');
                }
            }

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
            detailedMajor: userDetails.detailedMajor || '',
            otherMajor: userDetails.otherMajor || '',
            studentId: userDetails.studentId,
            bio: userDetails.bio,
            interests: userDetails.interests,
            spokenLanguages: userDetails.spokenLanguages,
            desiredLanguages: userDetails.desiredLanguages,
            mbti: userDetails.mbti,
            status: userDetails.status,
            industry: userDetails.industry || '',
            networkingGoal: userDetails.networkingGoal || '',
            otherNetworkingGoal: userDetails.otherNetworkingGoal || ''
        });
        setShowEditForm(false);
    };

    // ✅ 사용자의 지부에 따른 상태 옵션 가져오기
    const getUserStatusOptions = () => {
        const activeBranches = getActiveBranches(userDetails);
        if (activeBranches.includes('TAIPEI')) {
            return STATUS_OPTIONS.TAIPEI;
        } else if (activeBranches.includes('NCCU') || activeBranches.includes('NTU')) {
            return STATUS_OPTIONS.NCCU; // NCCU와 NTU는 동일
        }
        return STATUS_OPTIONS.TAIPEI; // 기본값
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
                                {userDetails.status && <p>💼 {userDetails.status}</p>}
                                {userDetails.mbti && <p>🧠 {userDetails.mbti}</p>}
                                {/* ✅ Taipei 멤버십 세부 정보 표시 */}
                                {userDetails.status && userDetails.status !== 'Student' && userDetails.industry && (
                                    <p>🏢 {userDetails.industry}</p>
                                )}
                                {userDetails.status && userDetails.status !== 'Student' && userDetails.networkingGoal && (
                                    <p>🎯 {userDetails.networkingGoal}{userDetails.otherNetworkingGoal && userDetails.networkingGoal === 'Other' ? `: ${userDetails.otherNetworkingGoal}` : ''}</p>
                                )}
                            </div>
                            
                            {/* ✅ Bio는 읽기 전용으로 표시 */}
                            <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 min-h-[80px] flex items-center justify-center">
                                {userDetails.bio ? (
                                    <p className="text-center">{userDetails.bio}</p>
                                ) : (
                                    <p className="text-gray-500 text-center">No bio yet. Click Edit Profile to add one!</p>
                                )}
                            </div>

                            {/* ✅ 편집 버튼 */}
                            <button 
                                onClick={() => setShowEditForm(true)} 
                                className="mt-3 w-full py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                Edit Profile
                            </button>
                            
                            <Link to="/change-password" className="mt-2 w-full inline-block text-center py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Change Password
                            </Link>
                        </div>

                        {/* ✅ 멤버십 카드 - 실제 branch 정보 표시 */}
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
                                            {/* 이벤트 선택 드롭다운 */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Event for Check-in
                                                </label>
                                                <select
                                                    value={selectedEventForQr?.id || ''}
                                                    onChange={(e) => {
                                                        const eventId = e.target.value;
                                                        const event = availableEvents.find(evt => evt.id.toString() === eventId);
                                                        setSelectedEventForQr(event);
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Choose an event...</option>
                                                    {availableEvents.map(event => (
                                                        <option key={event.id} value={event.id}>
                                                            {event.title} ({event.branch}) - {new Date(event.eventDateTime).toLocaleDateString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* QR 코드 표시 */}
                                            {selectedEventForQr ? (
                                                <>
                                                    <div className="p-4 bg-white inline-block rounded-lg shadow-inner">
                                                        <QRCodeSVG value={qrCodeValue} size={180} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3">
                                                        Please show this QR code to our staff at the event entrance.
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Event: {selectedEventForQr.title}
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="p-4 bg-gray-100 rounded-lg">
                                                    <p className="text-gray-500">Please select an event to generate QR code</p>
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => setShowQrCode(false)} 
                                                className="text-xs text-gray-500 mt-2 hover:underline"
                                            >
                                                Hide QR Code
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => setShowQrCode(true)} 
                                            className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
                                        >
                                            Show Event Check-in Code
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ✅ 3D 뱃지/업적 섹션 (모바일 버전) */}
                        <div className="bg-white p-6 rounded-lg shadow-md lg:hidden">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🏆</span>
                                Achievements
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 모든 벳지 카테고리를 표시 (달성 여부와 관계없이) */}
                                {Object.values(BADGE_CATEGORIES).map((category, index) => {
                                    const userBadge = userDetails.badges?.find(b => b.id === category.id);
                                    const currentLevel = userBadge?.currentLevel || 0;
                                    const isEarned = currentLevel > 0;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 min-h-[200px] ${
                                                isEarned 
                                                    ? 'animate-pulse' 
                                                    : 'opacity-60 hover:opacity-80'
                                            }`}
                                            onClick={() => showBadgeDetails(category, currentLevel)}
                                        >
                                            {/* 3D 벳지 효과 */}
                                            <div className={`
                                                relative p-4 rounded-xl shadow-lg border-2 transition-all duration-300 h-full flex flex-col justify-between
                                                ${isEarned 
                                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-yellow-200/50' 
                                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 shadow-gray-200/50'
                                                }
                                                group-hover:shadow-2xl group-hover:-translate-y-1
                                            `}>
                                                {/* 벳지 아이콘 */}
                                                <div className="text-center mb-3">
                                                    <span className={`text-4xl filter drop-shadow-lg ${
                                                        isEarned ? 'animate-bounce' : ''
                                                    }`}>
                                                        {category.icon}
                                                    </span>
                                                </div>
                                                
                                                {/* 벳지 정보 */}
                                                <div className="text-center flex-grow">
                                                    <h4 className={`font-bold text-sm mb-1 ${
                                                        isEarned ? 'text-white' : 'text-gray-700'
                                                    }`}>
                                                        {category.name}
                                                    </h4>
                                                    <p className={`text-xs mb-2 overflow-hidden ${
                                                        isEarned ? 'text-yellow-100' : 'text-gray-600'
                                                    }`} style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {category.description}
                                                    </p>
                                                    
                                                    {/* 레벨 표시 */}
                                                    <div className={`
                                                        inline-block px-2 py-1 rounded-full text-xs font-bold
                                                        ${isEarned 
                                                            ? 'bg-white/20 text-white border border-white/30' 
                                                            : 'bg-gray-200/50 text-gray-700 border border-gray-300/30'
                                                        }
                                                    `}>
                                                        {isEarned ? `Level ${currentLevel}` : 'Not Earned'}
                                                    </div>
                                                </div>
                                                
                                                {/* 진행률 바 (달성한 경우만) */}
                                                {isEarned && currentLevel < 3 && (
                                                    <div className="mt-3">
                                                        <div className="w-full bg-white/20 rounded-full h-2">
                                                            <div 
                                                                className="bg-white h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${(currentLevel / 3) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-white/80 mt-1 text-center">
                                                            {currentLevel}/3 Levels
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* 3D 그림자 효과 */}
                                            <div className={`
                                                absolute inset-0 rounded-xl transition-all duration-300
                                                ${isEarned 
                                                    ? 'bg-gradient-to-br from-yellow-600 to-orange-600' 
                                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                                }
                                                -z-10 blur-sm opacity-50 group-hover:opacity-70
                                            `}></div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* 벳지 획득 가이드 */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 How to earn badges:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• <strong>Community:</strong> Post, comment, and get likes</li>
                                    <li>• <strong>Events:</strong> Attend SLAM events regularly</li>
                                    <li>• <strong>Membership:</strong> Register for multiple semesters</li>
                                    <li>• <strong>Influence:</strong> Create trending content</li>
                                    <li>• <strong>Special:</strong> Help others and get recognized</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* ✅ 3D 뱃지/업적 섹션 (PC 버전 - 조건부 렌더링) */}
                        {isLargeScreen && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🏆</span>
                                Achievements
                            </h3>

                            {/* PC 버전: 5개 벳지를 한 줄로 배치 */}
                            <div className="grid grid-cols-5 gap-4">
                                {/* 모든 벳지 카테고리를 표시 (달성 여부와 관계없이) */}
                                {Object.values(BADGE_CATEGORIES).map((category, index) => {
                                    const userBadge = userDetails.badges?.find(b => b.id === category.id);
                                    const currentLevel = userBadge?.currentLevel || 0;
                                    const isEarned = currentLevel > 0;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 min-h-[200px] ${
                                                isEarned 
                                                    ? 'animate-pulse' 
                                                    : 'opacity-60 hover:opacity-80'
                                            }`}
                                            onClick={() => showBadgeDetails(category, currentLevel)}
                                        >
                                            {/* 3D 벳지 효과 */}
                                            <div className={`
                                                relative p-4 rounded-xl shadow-lg border-2 transition-all duration-300 h-full flex flex-col justify-between
                                                ${isEarned 
                                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-yellow-200/50' 
                                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 shadow-gray-200/50'
                                                }
                                                group-hover:shadow-2xl group-hover:-translate-y-1
                                            `}>
                                                {/* 벳지 아이콘 */}
                                                <div className="text-center mb-3">
                                                    <span className={`text-3xl filter drop-shadow-lg ${
                                                        isEarned ? 'animate-bounce' : ''
                                                    }`}>
                                                        {category.icon}
                                                    </span>
                                                </div>
                                                
                                                {/* 벳지 정보 */}
                                                <div className="text-center flex-grow">
                                                    <h4 className={`font-bold text-xs mb-1 ${
                                                        isEarned ? 'text-white' : 'text-gray-700'
                                                    }`}>
                                                        {category.name}
                                                    </h4>
                                                    <p className={`text-xs mb-2 overflow-hidden ${
                                                        isEarned ? 'text-yellow-100' : 'text-gray-600'
                                                    }`} style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {category.description}
                                                    </p>
                                                    
                                                    {/* 레벨 표시 */}
                                                    <div className={`
                                                        inline-block px-2 py-1 rounded-full text-xs font-bold
                                                        ${isEarned 
                                                            ? 'bg-white/20 text-white border border-white/30' 
                                                            : 'bg-gray-200/50 text-gray-700 border border-gray-300/30'
                                                        }
                                                    `}>
                                                        {isEarned ? `Level ${currentLevel}` : 'Not Earned'}
                                                    </div>
                                                </div>
                                                
                                                {/* 진행률 바 (달성한 경우만) */}
                                                {isEarned && currentLevel < 3 && (
                                                    <div className="mt-3">
                                                        <div className="w-full bg-white/20 rounded-full h-2">
                                                            <div 
                                                                className="bg-white h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${(currentLevel / 3) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-white/80 mt-1 text-center">
                                                            {currentLevel}/3 Levels
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* 3D 그림자 효과 */}
                                            <div className={`
                                                absolute inset-0 rounded-xl transition-all duration-300
                                                ${isEarned 
                                                    ? 'bg-gradient-to-br from-yellow-600 to-orange-600' 
                                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                                }
                                                -z-10 blur-sm opacity-50 group-hover:opacity-70
                                            `}></div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* 벳지 획득 가이드 */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 How to earn badges:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• <strong>Community:</strong> Post, comment, and get likes</li>
                                    <li>• <strong>Events:</strong> Attend SLAM events regularly</li>
                                    <li>• <strong>Membership:</strong> Register for multiple semesters</li>
                                    <li>• <strong>Influence:</strong> Create trending content</li>
                                    <li>• <strong>Special:</strong> Help others and get recognized</li>
                                </ul>
                            </div>
                        </div>
                        )}

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

                {/* ✅ 개선된 편집 모달 */}
                {showEditForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        placeholder="0912-345-678"
                                    />
                                </div>
                                


                                                                {/* Status (이름 필드와 동일한 길이) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editFormData.status || ''}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {getUserStatusOptions().map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                                                {/* ✅ Student ID (Student 선택 시에만 표시) - 전체 너비 */}
                                {editFormData.status === 'Student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student ID
                                            {studentIdEditCount >= 1 && (
                                                <span className="text-red-500 ml-1">(Can only change once)</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={editFormData.studentId || ''}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                studentIdEditCount >= 1 ? 'bg-gray-100 cursor-not-allowed' : ''
                                            }`}
                                            placeholder="110512345"
                                            disabled={studentIdEditCount >= 1}
                                        />
                                        {studentIdEditCount >= 1 && (
                                            <p className="text-xs text-red-500 mt-1">You have already used your chance to change Student ID</p>
                                        )}
                                    </div>
                                )}

                                {/* ✅ Major (Student 선택 시에만 표시) - 전체 너비 */}
                                {editFormData.status === 'Student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                                        <select
                                            name="major"
                                            value={editFormData.major || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select your field of study</option>
                                            {unifiedMajors.map(major => (
                                                <option key={major} value={major}>{major}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* ✅ Detailed Major (Student 선택 시에만 표시) - 전체 너비 */}
                                {editFormData.status === 'Student' && editFormData.major && editFormData.major !== 'Others' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Major (Optional)</label>
                                        <input 
                                            type="text" 
                                            name="detailedMajor" 
                                            placeholder="e.g., Computer Science, Business Administration, International Relations" 
                                            value={editFormData.detailedMajor || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-blue-200" 
                                        />
                                    </div>
                                )}
                                
                                {/* ✅ 기타 전공 입력 (Student 선택 시에만 표시) - 전체 너비 */}
                                {editFormData.status === 'Student' && editFormData.major === 'Others' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specify Major</label>
                                        <input 
                                            type="text" 
                                            name="otherMajor" 
                                            placeholder="Please specify your field of study" 
                                            value={editFormData.otherMajor || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md" 
                                            required
                                        />
                                    </div>
                                )}
                                
                                



                                {/* ✅ Industry (Professional 계열만 표시) */}
                                {editFormData.status && editFormData.status !== 'Student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <select
                                            name="industry"
                                            value={editFormData.industry || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Industry</option>
                                            {INDUSTRY_CATEGORIES.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* ✅ Goal (Professional 계열만 표시) */}
                                {editFormData.status && editFormData.status !== 'Student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                                        <select
                                            name="networkingGoal"
                                            value={editFormData.networkingGoal || ''}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select your goal</option>
                                            {/* 비즈니스 네트워킹 */}
                                            <option value="Business Partner">Business Partner</option>
                                            <option value="Client / Customer">Client / Customer</option>
                                            <option value="Employee / Team Member">Employee / Team Member</option>
                                            <option value="Investor">Investor</option>
                                            <option value="Mentor / Advisor">Mentor / Advisor</option>
                                            {/* 일반 네트워킹 */}
                                            <option value="Expand Social Network">Expand Social Network</option>
                                            <option value="Make New Friends">Make New Friends</option>
                                            <option value="Find Hobby Partners">Find Hobby Partners</option>
                                            {/* 데이팅 & 관계 */}
                                            <option value="Dating & Relationships">Dating & Relationships</option>
                                            <option value="Find Life Partner">Find Life Partner</option>
                                            {/* 기타 */}
                                            <option value="Cultural Exchange">Cultural Exchange</option>
                                            <option value="Language Exchange">Language Exchange</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        
                                        {/* ✅ Other 선택 시 텍스트 입력 필드 */}
                                        {editFormData.networkingGoal === 'Other' && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="otherNetworkingGoal"
                                                    placeholder="Please specify your goal..."
                                                    value={editFormData.otherNetworkingGoal || ''}
                                                    onChange={handleEditFormChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ✅ 태그 형식 필드들 */}
                            <div className="mt-6 space-y-4">
                                {/* MBTI */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">MBTI</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3 border border-gray-300 rounded-md min-h-[80px] bg-gray-50">
                                        {MBTI_OPTIONS.map(mbti => (
                                            <button
                                                key={mbti}
                                                type="button"
                                                onClick={() => handleTagToggle('mbti', mbti)}
                                                className={`px-2 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                                    editFormData.mbti === mbti
                                                        ? 'bg-purple-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {mbti}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Click to select your MBTI type</p>
                                </div>

                                {/* 관심사 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 border border-gray-300 rounded-md min-h-[80px] bg-gray-50">
                                        {INTERESTS_OPTIONS.map(interest => (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => handleTagToggle('interests', interest)}
                                                className={`px-2 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                                    editFormData.interests?.includes(interest)
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect interests</p>
                                </div>
                                
                                {/* 구사 언어 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Spoken Languages</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 p-3 border border-gray-300 rounded-md min-h-[80px] bg-gray-50">
                                        {LANGUAGE_OPTIONS.filter(lang => lang !== 'Others').map(language => (
                                            <button
                                                key={language}
                                                type="button"
                                                onClick={() => handleTagToggle('spokenLanguages', language)}
                                                className={`px-2 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                                    editFormData.spokenLanguages?.includes(language)
                                                        ? 'bg-green-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {language}
                                            </button>
                                        ))}
                                        {/* 사용자가 추가한 기타 언어들 */}
                                        {editFormData.spokenLanguages?.filter(lang => !LANGUAGE_OPTIONS.includes(lang)).map(language => (
                                            <button
                                                key={language}
                                                type="button"
                                                onClick={() => handleTagToggle('spokenLanguages', language)}
                                                className="px-2 py-2 rounded-full text-xs bg-green-500 text-white shadow-md"
                                            >
                                                {language} ✕
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect languages you can speak</p>
                                    
                                    {/* Others 입력 필드 */}
                                    <div className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                            value={otherSpokenLanguage}
                                            onChange={(e) => setOtherSpokenLanguage(e.target.value)}
                                            placeholder="Add other language..."
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddOtherLanguage('spokenLanguages', otherSpokenLanguage, setOtherSpokenLanguage);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddOtherLanguage('spokenLanguages', otherSpokenLanguage, setOtherSpokenLanguage)}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                                
                                {/* 배우고 싶은 언어 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Languages</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 p-3 border border-gray-300 rounded-md min-h-[80px] bg-gray-50">
                                        {LANGUAGE_OPTIONS.filter(lang => lang !== 'Others').map(language => (
                                            <button
                                                key={language}
                                                type="button"
                                                onClick={() => handleTagToggle('desiredLanguages', language)}
                                                className={`px-2 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                                    editFormData.desiredLanguages?.includes(language)
                                                        ? 'bg-purple-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {language}
                                            </button>
                                        ))}
                                        {/* 사용자가 추가한 기타 언어들 */}
                                        {editFormData.desiredLanguages?.filter(lang => !LANGUAGE_OPTIONS.includes(lang)).map(language => (
                                            <button
                                                key={language}
                                                type="button"
                                                onClick={() => handleTagToggle('desiredLanguages', language)}
                                                className="px-2 py-2 rounded-full text-xs bg-purple-500 text-white shadow-md"
                                            >
                                                {language} ✕
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Click to select/deselect languages you want to learn</p>
                                    
                                    {/* Others 입력 필드 */}
                                    <div className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                            value={otherDesiredLanguage}
                                            onChange={(e) => setOtherDesiredLanguage(e.target.value)}
                                            placeholder="Add other language..."
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddOtherLanguage('desiredLanguages', otherDesiredLanguage, setOtherDesiredLanguage);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddOtherLanguage('desiredLanguages', otherDesiredLanguage, setOtherDesiredLanguage)}
                                            className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
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

                {/* ✅ 벳지 상세 정보 모달 */}
                {showBadgeModal && selectedBadge && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            {/* 벳지 헤더 */}
                            <div className="text-center mb-6">
                                <div className={`inline-block p-4 rounded-full mb-4 ${
                                    selectedBadgeLevel > 0 
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                        : 'bg-gradient-to-br from-gray-300 to-gray-400'
                                }`}>
                                    <span className="text-6xl filter drop-shadow-lg">
                                        {selectedBadge.icon}
                                    </span>
                                </div>
                                <h2 className={`text-xl font-bold mb-2 ${
                                    selectedBadgeLevel > 0 ? 'text-gray-800' : 'text-gray-600'
                                }`}>
                                    {selectedBadge.name}
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {selectedBadge.description}
                                </p>
                            </div>

                            {/* 현재 상태 */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Current Status</h3>
                                {selectedBadgeLevel > 0 ? (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600 mb-2">
                                            Level {selectedBadgeLevel} Achieved! 🎉
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div 
                                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${(selectedBadgeLevel / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {selectedBadgeLevel}/3 Levels Completed
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <div className="text-lg mb-2">Not earned yet</div>
                                        <p className="text-sm">Start participating to earn this badge!</p>
                                    </div>
                                )}
                            </div>

                            {/* 레벨별 요구사항 */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Level Requirements</h3>
                                <div className="space-y-3">
                                    {selectedBadge.levels.map((level, index) => (
                                        <div key={index} className={`p-3 rounded-lg border-2 transition-all ${
                                            index < selectedBadgeLevel 
                                                ? 'border-green-300 bg-green-50' 
                                                : index === selectedBadgeLevel 
                                                    ? 'border-blue-300 bg-blue-50' 
                                                    : 'border-gray-200 bg-gray-50'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-semibold text-sm ${
                                                    index < selectedBadgeLevel 
                                                        ? 'text-green-700' 
                                                        : index === selectedBadgeLevel 
                                                            ? 'text-blue-700' 
                                                            : 'text-gray-600'
                                                }`}>
                                                    Level {index + 1}: {level.name}
                                                </h4>
                                                {index < selectedBadgeLevel && (
                                                    <span className="text-green-600 text-lg">✅</span>
                                                )}
                                                {index === selectedBadgeLevel && (
                                                    <span className="text-blue-600 text-lg">🎯</span>
                                                )}
                                            </div>
                                            <p className={`text-xs ${
                                                index < selectedBadgeLevel 
                                                    ? 'text-green-600' 
                                                    : index === selectedBadgeLevel 
                                                        ? 'text-blue-600' 
                                                        : 'text-gray-500'
                                            }`}>
                                                {level.description}
                                            </p>
                                            <div className={`text-xs font-medium mt-1 ${
                                                index < selectedBadgeLevel 
                                                    ? 'text-green-600' 
                                                    : index === selectedBadgeLevel 
                                                        ? 'text-blue-600' 
                                                        : 'text-gray-500'
                                            }`}>
                                                Requirement: {level.requirement}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 닫기 버튼 */}
                            <div className="text-center">
                                <button
                                    onClick={() => setShowBadgeModal(false)}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}