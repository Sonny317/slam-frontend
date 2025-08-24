/**
 * 사용자 권한 관련 유틸리티 함수들
 */

// STAFF 이상의 권한을 가진 역할들
const ADMIN_ROLES = ['STAFF', 'LEADER', 'PRESIDENT', 'ADMIN'];

// 스태프 임명 권한을 가진 역할들 (계층 구조 적용)
const STAFF_ASSIGNMENT_ROLES = ['LEADER', 'PRESIDENT', 'ADMIN'];

/**
 * 역할의 계층 레벨 반환 (숫자가 낮을수록 높은 권한)
 * @param {string} role - 사용자 역할
 * @returns {number} 계층 레벨
 */
const getHierarchyLevel = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 1;
    case 'PRESIDENT': return 2;
    case 'LEADER': return 3;
    case 'STAFF': return 4;
    case 'MEMBER': return 5;
    default: return 99;
  }
};

/**
 * 특정 역할을 임명할 수 있는지 확인 (계층 구조 기반)
 * @param {string} assignerRole - 임명하는 사람의 역할
 * @param {string} targetRole - 임명하려는 역할
 * @returns {boolean} 임명 가능 여부
 */
export const canAssignRole = (assignerRole, targetRole) => {
  const assigner = assignerRole?.toUpperCase();
  const target = targetRole?.toUpperCase();
  
  switch (assigner) {
    case 'ADMIN':
      // Admin은 모든 역할 임명 가능 (Admin 제외)
      return target !== 'ADMIN';
    case 'PRESIDENT':
      // President는 하위 역할만 임명 가능 (Admin, President 제외)
      return target === 'LEADER' || target === 'STAFF' || target === 'MEMBER';
    case 'LEADER':
      // Leader는 Staff와 Member만 임명 가능
      return target === 'STAFF' || target === 'MEMBER';
    case 'STAFF':
    case 'MEMBER':
      // Staff와 Member는 임명 권한 없음
      return false;
    default:
      return false;
  }
};

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
 * 특정 사용자에게 역할 임명 버튼을 보여줄지 확인
 * @param {string} currentUserRole - 현재 로그인한 사용자의 역할
 * @param {string} targetUserRole - 대상 사용자의 역할
 * @returns {boolean} 버튼 표시 여부
 */
export const shouldShowAssignButton = (currentUserRole, targetUserRole) => {
  // 기본적으로 스태프 임명 권한이 있어야 함
  if (!canAssignStaff(currentUserRole)) {
    return false;
  }
  
  // 자신보다 높은 권한의 사용자에게는 임명 불가
  const currentLevel = getHierarchyLevel(currentUserRole);
  const targetLevel = getHierarchyLevel(targetUserRole);
  
  // Admin에게는 President나 하위 권한만 버튼 표시
  if (currentUserRole?.toUpperCase() === 'ADMIN') {
    return targetLevel >= 2; // President(2) 이하만
  }
  
  // President에게는 Admin에게 버튼 표시 안함
  if (currentUserRole?.toUpperCase() === 'PRESIDENT') {
    return targetLevel > 1; // Admin(1) 제외
  }
  
  // Leader에게는 자신보다 낮은 권한에게만 버튼 표시
  return currentLevel < targetLevel;
};

/**
 * 현재 사용자가 임명할 수 있는 역할들 반환
 * @param {string} currentUserRole - 현재 사용자의 역할
 * @param {string} targetUserRole - 대상 사용자의 현재 역할 (중복 방지용)
 * @returns {Array} 임명 가능한 역할 목록
 */
export const getAssignableRoles = (currentUserRole, targetUserRole = null) => {
  let availableRoles = [];
  
  switch (currentUserRole?.toUpperCase()) {
    case 'ADMIN':
      availableRoles = ['PRESIDENT', 'LEADER', 'STAFF', 'MEMBER'];
      break;
    case 'PRESIDENT':
      availableRoles = ['LEADER', 'STAFF', 'MEMBER'];
      break;
    case 'LEADER':
      availableRoles = ['STAFF', 'MEMBER'];
      break;
    default:
      return [];
  }
  
  // 현재 역할과 같은 역할은 제외 (중복 방지)
  if (targetUserRole) {
    availableRoles = availableRoles.filter(role => role !== targetUserRole?.toUpperCase());
  }
  
  return availableRoles;
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
