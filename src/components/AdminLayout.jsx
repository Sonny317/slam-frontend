// src/components/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';

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
  // 가짜 로그인 정보 (나중에 실제 데이터로 교체)
  const loggedInStaff = { name: 'Sonny', role: 'President' };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
          <span>SLAM Staff</span>
          {/* 메인 사이트로 돌아가는 버튼 */}
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
        {/* 상단바 추가 */}
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="flex items-center">
            <span className="font-semibold">{loggedInStaff.name}</span>
            <span className="text-sm text-gray-500 ml-2">({loggedInStaff.role})</span>
            <button className="ml-4 text-sm text-red-500 hover:underline">Log Out</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet /> {/* 여기에 각 페이지의 내용이 렌더링됩니다. */}
        </main>
      </div>
    </div>
  );
}
