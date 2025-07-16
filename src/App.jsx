import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import EventDetailPage from "./pages/EventDetailPage";
import MainHeader from './components/MainHeader';
import EventsPage from './pages/EventsPage'; // ✅ 새로 만든 목록 페이지 불러오기
import PartnershipPage from './pages/PartnershipPage'; // ✅ 추가
import BrandStoryPage from './pages/BrandStoryPage'; // ✅ 추가
import MembershipPage from './pages/MembershipPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ✅ 1. 새 페이지 import



export default function App() {
  return (
    <Router>
      <MainHeader />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about-us" element={<BrandStoryPage />} /> {/* ✅ 추가 */}
        <Route path="/events" element={<EventsPage />} /> {/* ✅ 목록 페이지 경로 추가 */}
        <Route path="/events/:eventId" element={<EventDetailPage />} /> {/* ✅ 상세 페이지 경로 수정 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/partnership" element={<PartnershipPage />} /> {/* ✅ 추가 */}
        <Route path="/Membership" element={<MembershipPage />} /> {/* ✅ 추가 */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* ✅ 2. 새 경로 추가 */}

      </Routes>
    </Router>
  );
}