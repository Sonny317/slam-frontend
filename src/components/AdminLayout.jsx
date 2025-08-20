import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { hasAdminAccess } from '../utils/permissions';

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
  const { user, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 변경 감지하여 모바일 메뉴 상태 초기화
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1200;
      setIsMobile(isMobileView);
      
      if (!isMobileView) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 마운트 시에도 한 번 체크
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // STAFF 이상의 권한을 가진 사용자만 Admin 페이지 접근 허용
  if (!user.isLoggedIn || !hasAdminAccess(user.role)) {
    return <Navigate to="/" replace />;
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
          <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
            <span>SLAM Staff</span>
            <Link to="/" title="Go to Main Site" className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
          <nav className="flex-grow">
            {adminNavLinks.map(link => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => `block px-6 py-3 transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}

            {/* Mobile Title */}
            {isMobile && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">SLAM Staff</span>
                <Link to="/" title="Go to Main Site" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="font-semibold text-sm sm:text-base text-gray-900">{user.email}</span>
                <span className="text-xs sm:text-sm text-gray-500">({user.role})</span>
              </div>
              <button 
                onClick={logout} 
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium transition-colors px-3 py-1 rounded-md hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Panel */}
        {isMobile && isMobileMenuOpen && (
          <div className="bg-gray-800 text-white">
            <nav className="flex flex-col">
              {adminNavLinks.map(link => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `block px-6 py-4 transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}