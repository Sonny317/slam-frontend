import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainHeader from "./components/MainHeader";
import AdminLayout from "./components/AdminLayout";

// --- Public Pages ---
import MainPage from "./pages/MainPage";
import BrandStoryPage from './pages/BrandStoryPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import TicketPurchasePage from './pages/TicketPurchasePage';
import MembershipPage from './pages/MembershipPage';
import PartnershipPage from './pages/PartnershipPage';
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; // ?????˜ì´ì§€ ?„í¬??
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
import AdminGamesPage from './pages/AdminGamesPage';
import GameAnalyticsPage from './pages/GameAnalyticsPage';

//Feedbackform
import FeedbackFormPage from './pages/FeedbackFormPage'; // ???¼ë“œë°????˜ì´ì§€ import
import StaffFeedbackFormPage from './pages/StaffFeedbackFormPage'; // ???¤íƒœ???¼ë“œë°????˜ì´ì§€ import
import CommunityPage from './pages/CommunityPage'; // ??ì»¤ë??ˆí‹° ?˜ì´ì§€ import
import NewPostPage from './pages/NewPostPage'; // ????ê²Œì‹œê¸€ ?‘ì„± ?˜ì´ì§€ import
import PostDetailPage from './pages/PostDetailPage'; // ??ê²Œì‹œê¸€ ?ì„¸ ?˜ì´ì§€ import
import StaffOnboardingPage from './pages/StaffOnboardingPage'; // ???¤íƒœ???¨ë³´???˜ì´ì§€ import
import GoogleCallbackPage from './pages/GoogleCallbackPage'; // ??Google OAuth ì½œë°± ?˜ì´ì§€ import


// --- Public Layout Component ---
const PublicLayout = ({ children }) => (
  <>
    <MainHeader />
    {children}
  </>
);

export default function App() {
  return (
    // ??UserProvider??index.jsë¡???²¼?¼ë?ë¡??¬ê¸°?œëŠ” ?¬ìš©?˜ì? ?ŠìŠµ?ˆë‹¤.
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><MainPage /></PublicLayout>} />
        <Route path="/about-us" element={<PublicLayout><BrandStoryPage /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
        <Route path="/events/:eventId" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
        <Route path="/events/:eventId/ticket" element={<PublicLayout><TicketPurchasePage /></PublicLayout>} />
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
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* ????ê²½ë¡œ ì¶”ê? */}
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/staff-onboarding" element={<StaffOnboardingPage />} /> {/* ???¤íƒœ???¨ë³´???˜ì´ì§€ ì¶”ê? */}
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} /> {/* ??Google OAuth ì½œë°± ê²½ë¡œ ?˜ì • */}

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
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="game-analytics" element={<GameAnalyticsPage />} />

        </Route>
      </Routes>
    </Router>
  );
}
