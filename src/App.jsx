import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainHeader from "./components/MainHeader";
import AdminLayout from "./components/AdminLayout";

// --- Public Pages ---
import MainPage from "./pages/MainPage";
import BrandStoryPage from './pages/BrandStoryPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MembershipPage from './pages/MembershipPage';
import PartnershipPage from './pages/PartnershipPage';
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; // ✅ 새 페이지 임포트
import ChangePasswordPage from './pages/ChangePasswordPage';
import UserProfilePage from './pages/UserProfilePage';


// --- Admin Pages ---
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminScannerPage from './pages/AdminScannerPage';
import AdminActionPlanPage from './pages/AdminActionPlanPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminFeedbackPage from './pages/AdminFeedbackPage';
import AdminStaffInfoPage from './pages/AdminStaffInfoPage';
import AdminMemberManagementPage from './pages/AdminMemberManagementPage';
import AdminEventsPage from './pages/AdminEventsPage';

//Feedbackform
import FeedbackFormPage from './pages/FeedbackFormPage'; // ✅ 피드백 폼 페이지 import
import StaffFeedbackFormPage from './pages/StaffFeedbackFormPage'; // ✅ 스태프 피드백 폼 페이지 import
import CommunityPage from './pages/CommunityPage'; // ✅ 커뮤니티 페이지 import
import NewPostPage from './pages/NewPostPage'; // ✅ 새 게시글 작성 페이지 import
import PostDetailPage from './pages/PostDetailPage'; // ✅ 게시글 상세 페이지 import
import StaffOnboardingPage from './pages/StaffOnboardingPage'; // ✅ 스태프 온보딩 페이지 import


// --- Public Layout Component ---
const PublicLayout = ({ children }) => (
  <>
    <MainHeader />
    {children}
  </>
);

export default function App() {
  return (
    // ❌ UserProvider는 index.js로 옮겼으므로 여기서는 사용하지 않습니다.
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><MainPage /></PublicLayout>} />
        <Route path="/about-us" element={<PublicLayout><BrandStoryPage /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
        <Route path="/events/:eventId" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
        <Route path="/membership" element={<PublicLayout><MembershipPage /></PublicLayout>} />
        <Route path="/partnership" element={<PublicLayout><PartnershipPage /></PublicLayout>} />
        <Route path="/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />
        <Route path="/community/new" element={<PublicLayout><NewPostPage /></PublicLayout>} />
        <Route path="/community/post/:postId" element={<PublicLayout><PostDetailPage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />
        <Route path="/mypage" element={<PublicLayout><MyPage /></PublicLayout>} />
        <Route path="/change-password" element={<PublicLayout><ChangePasswordPage /></PublicLayout>} />
        <Route path="/users/:userId" element={<PublicLayout><UserProfilePage /></PublicLayout>} />
        <Route path="/users/profile" element={<PublicLayout><UserProfilePage /></PublicLayout>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* ✅ 새 경로 추가 */}
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/staff-onboarding" element={<StaffOnboardingPage />} /> {/* ✅ 스태프 온보딩 페이지 추가 */}

        {/* Standalone Feedback Form Page */}
        <Route path="/feedback/event/:eventId" element={<FeedbackFormPage />} />
        <Route path="/feedback/staff/:eventId" element={<StaffFeedbackFormPage />} />
        
        {/* Admin Routes (Nested inside AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="scanner" element={<AdminScannerPage />} />
          <Route path="tasks" element={<AdminActionPlanPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="staff" element={<AdminStaffInfoPage />} />
          <Route path="members" element={<AdminMemberManagementPage />} />
          <Route path="events" element={<AdminEventsPage />} />

        </Route>
      </Routes>
    </Router>
  );
}