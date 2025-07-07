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


export default function App() {
  return (
    <Router>
      <MainHeader />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/events" element={<EventsPage />} /> {/* ✅ 목록 페이지 경로 추가 */}
        <Route path="/events/:eventId" element={<EventDetailPage />} /> {/* ✅ 상세 페이지 경로 수정 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/partnership" element={<PartnershipPage />} /> {/* ✅ 추가 */}
      </Routes>
    </Router>
  );
}