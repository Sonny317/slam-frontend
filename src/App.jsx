import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import EventDetailPage from "./pages/EventDetailPage";
import MainHeader from './components/MainHeader';

export default function App() {
  return (
    <Router>
      <MainHeader /> {/* 헤더를 Routes 바깥에 두면 모든 페이지에 적용됩니다. */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/events/pilot" element={<EventDetailPage />} />
      </Routes>
      {/* 여기에 Footer 컴포넌트를 추가할 수도 있습니다. */}
    </Router>
  );
}
