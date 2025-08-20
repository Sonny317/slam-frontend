/**
 * 사용자 권한 관련 유틸리티 함수들
 */

// STAFF 이상의 권한을 가진 역할들
const ADMIN_ROLES = ['STAFF', 'LEADER', 'PRESIDENT', 'ADMIN'];

// 스태프 임명 권한을 가진 역할들
const STAFF_ASSIGNMENT_ROLES = ['PRESIDENT', 'ADMIN'];

/**
 * 사용자가 관리자 페이지에 접근할 수 있는지 확인
 * @param {string} role - 사용자 역할
 * @returns {boolean} 접근 권한 여부
 */
export const hasAdminAccess = (role) => {
  return ADMIN_ROLES.includes(role);
};

/**
 * 사용자가 스태프를 임명할 수 있는지 확인
 * @param {string} role - 사용자 역할
 * @returns {boolean} 스태프 임명 권한 여부
 */
export const canAssignStaff = (role) => {
  return STAFF_ASSIGNMENT_ROLES.includes(role);
};

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 * @param {string} role - 사용자 역할
 * @param {string} permission - 확인할 권한 ('admin', 'assign_staff')
 * @returns {boolean} 권한 여부
 */
export const hasPermission = (role, permission) => {
  switch (permission) {
    case 'admin':
      return hasAdminAccess(role);
    case 'assign_staff':
      return canAssignStaff(role);
    default:
      return false;
  }
};

/**
 * 역할별 표시 이름 반환
 * @param {string} role - 사용자 역할
 * @returns {string} 표시 이름
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'MEMBER': '일반 멤버',
    'STAFF': '스태프',
    'LEADER': '팀장',
    'PRESIDENT': '회장',
    'ADMIN': '관리자'
  };
  return roleNames[role] || role;
};

/**
 * 역할별 색상 클래스 반환 (Tailwind CSS)
 * @param {string} role - 사용자 역할
 * @returns {string} CSS 클래스
 */
export const getRoleColorClass = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'bg-red-100 text-red-800';
    case 'PRESIDENT': return 'bg-purple-100 text-purple-800';
    case 'LEADER': return 'bg-blue-100 text-blue-800';
    case 'STAFF': return 'bg-green-100 text-green-800';
    case 'MEMBER': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
