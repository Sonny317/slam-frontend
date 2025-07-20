import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import EventDetailPage from "./pages/EventDetailPage";
import MainHeader from './components/MainHeader';
import EventsPage from './pages/EventsPage';
import PartnershipPage from './pages/PartnershipPage';
import BrandStoryPage from './pages/BrandStoryPage';
import MembershipPage from './pages/MembershipPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import NewPostPage from './pages/NewPostPage';
import AdminScannerPage from './pages/AdminScannerPage';
import { UserProvider } from './context/UserContext'; // ✅ UserProvider를 임포트합니다.

export default function App() {
  return (
    // ✅ UserProvider로 전체를 감싸줍니다.
    <UserProvider>
      <Router>
        <MainHeader />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about-us" element={<BrandStoryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/partnership" element={<PartnershipPage />} />
          <Route path="/Membership" element={<MembershipPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/new" element={<NewPostPage />} />
          <Route path="/community/:postId" element={<PostDetailPage />} />
          <Route path="/admin/scanner" element={<AdminScannerPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}