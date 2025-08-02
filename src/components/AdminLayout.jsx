import React from 'react';
import { NavLink, Outlet, Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // ✅ 1. useUser 훅을 임포트합니다.

const adminNavLinks = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Member Management', path: '/admin/members' },
  { name: 'Event Management', path: '/admin/events' },
  { name: 'QR Scanner', path: '/admin/scanner' },
  { name: 'Action Plan', path: '/admin/tasks' },
  { name: 'Feedback', path: '/admin/feedback' },
  { name: 'Staff Info', path: '/admin/staff' },
  { name: 'Materials & Rules', path: '/admin/resources' },
];

export default function AdminLayout() {
  const { user, logout } = useUser(); // ✅ 2. Context에서 실제 user 정보와 logout 함수를 가져옵니다.

  // ✅ 3. 사용자가 ADMIN이 아니거나 로그아웃 상태이면 메인 페이지로 쫓아내는 보안 장치
  if (!user.isLoggedIn || user.role !== 'ADMIN') {
    // alert("You do not have permission to access this page."); // 필요하다면 경고창을 띄울 수 있습니다.
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
          <span>SLAM Staff</span>
          {/* ✅ 'Go to Main Site' 버튼은 Link to="/"로 이미 올바르게 작동합니다. */}
          <Link to="/" title="Go to Main Site" className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </Link>
        </div>
        <nav className="flex-grow">
          {adminNavLinks.map(link => (
            <NavLink key={link.path} to={link.path} className={({ isActive }) => `block px-6 py-3 transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="flex items-center">
            {/* ✅ 4. 가짜 데이터 대신 Context에서 가져온 실제 사용자 이름과 역할을 표시합니다. */}
            <span className="font-semibold">{user.email}</span> 
            <span className="text-sm text-gray-500 ml-2">({user.role})</span>
            {/* ✅ 5. onClick 이벤트에 Context에서 가져온 logout 함수를 연결합니다. */}
            <button onClick={logout} className="ml-4 text-sm text-red-500 hover:underline">Log Out</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>//
    </div>
  );
}