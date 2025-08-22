// ✅ 단순화된 뱃지 시스템 (5개 카테고리)
export const BADGE_CATEGORIES = {
  COMMUNITY: {
    id: 'community',
    name: 'Community Engagement',
    description: 'Posts, comments, and likes combined',
    icon: '💬',
    color: 'bg-blue-100 text-blue-800',
    levels: [
      { name: 'First Steps', requirement: 1, description: 'Made your first post or comment' },
      { name: 'Active Member', requirement: 25, description: 'Posted 10 times and commented 15 times' },
      { name: 'Community Leader', requirement: 100, description: 'Posted 50 times, commented 50 times, or received 100 likes' }
    ]
  },
  EVENTS: {
    id: 'events',
    name: 'Event Participation',
    description: 'SLAM event attendance',
    icon: '🎉',
    color: 'bg-pink-100 text-pink-800',
    levels: [
      { name: 'Event Explorer', requirement: 1, description: 'Attended your first SLAM event' },
      { name: 'Regular Attendee', requirement: 5, description: 'Attended 5 SLAM events' },
      { name: 'Event Enthusiast', requirement: 15, description: 'Attended 15 SLAM events' }
    ]
  },
  MEMBERSHIP: {
    id: 'membership',
    name: 'SLAM Membership',
    description: 'Number of memberships registered',
    icon: '🏅',
    color: 'bg-green-100 text-green-800',
    levels: [
      { name: 'First Timer', requirement: 1, description: 'Registered for your first semester' },
      { name: 'Returning Member', requirement: 2, description: 'Registered for 2 semesters' },
      { name: 'SLAM Veteran', requirement: 3, description: 'Registered for 3+ semesters' }
    ]
  },
  INFLUENCE: {
    id: 'influence',
    name: 'Community Influence',
    description: 'Trending posts and helpful contributions',
    icon: '🔥',
    color: 'bg-red-100 text-red-800',
    levels: [
      { name: 'Rising Star', requirement: 1, description: 'Created a trending post' },
      { name: 'Influencer', requirement: 5, description: 'Created 5 trending posts' },
      { name: 'Community Icon', requirement: 15, description: 'Created 15 trending posts' }
    ]
  },
  SPECIAL: {
    id: 'special',
    name: 'Special Recognition',
    description: 'Unique achievements and contributions',
    icon: '⭐',
    color: 'bg-purple-100 text-purple-800',
    levels: [
      { name: 'Helper', requirement: 10, description: 'Received 10+ helpful reactions' },
      { name: 'Mentor', requirement: 50, description: 'Received 50+ helpful reactions' },
      { name: 'SLAM Legend', requirement: 100, description: 'Outstanding community contributions' }
    ]
  }
};

// ✅ 새로운 뱃지 시스템 계산 (달성한 뱃지만 반환)
export const calculateUserBadges = (userStats) => {
  const categories = [];
  
  Object.values(BADGE_CATEGORIES).forEach(category => {
    const currentLevel = getCurrentBadgeLevel(category, userStats);
    const progress = getBadgeProgress(category, userStats);
    
    // ✅ 달성한 뱃지만 추가
    if (currentLevel > 0) {
      categories.push({
        ...category,
        currentLevel: currentLevel,
        progress: progress,
        isEarned: true
      });
    }
  });
  
  return categories;
};

// 현재 뱃지 레벨 계산
const getCurrentBadgeLevel = (category, userStats) => {
  let currentLevel = 0;
  
  switch (category.id) {
    case 'community':
      const communityScore = (userStats.posts || 0) + (userStats.comments || 0) + Math.floor((userStats.likes || 0) / 5);
      if (communityScore >= 100) currentLevel = 3;
      else if (communityScore >= 25) currentLevel = 2;
      else if (communityScore >= 1) currentLevel = 1;
      break;
      
    case 'events':
      const events = userStats.events || 0;
      if (events >= 15) currentLevel = 3;
      else if (events >= 5) currentLevel = 2;
      else if (events >= 1) currentLevel = 1;
      break;
      
    case 'membership':
      const membershipCount = userStats.membershipCount || 0;
      if (membershipCount >= 3) currentLevel = 3;
      else if (membershipCount >= 2) currentLevel = 2;
      else if (membershipCount >= 1) currentLevel = 1;
      break;
      
    case 'influence':
      const trending = userStats.trendingPosts || 0;
      if (trending >= 15) currentLevel = 3;
      else if (trending >= 5) currentLevel = 2;
      else if (trending >= 1) currentLevel = 1;
      break;
      
    case 'special':
      const helpful = userStats.helpfulReactions || 0;
      if (helpful >= 100) currentLevel = 3;
      else if (helpful >= 50) currentLevel = 2;
      else if (helpful >= 10) currentLevel = 1;
      break;
  }
  
  return currentLevel;
};

// 다음 레벨까지의 진행률 계산
const getBadgeProgress = (category, userStats) => {
  const currentLevel = getCurrentBadgeLevel(category, userStats);
  
  if (currentLevel >= 3) {
    return { current: 100, total: 100, percentage: 100 };
  }
  
  const nextLevel = currentLevel + 1;
  const nextRequirement = category.levels[nextLevel - 1].requirement;
  
  let current = 0;
  
  switch (category.id) {
    case 'community':
      current = (userStats.posts || 0) + (userStats.comments || 0) + Math.floor((userStats.likes || 0) / 5);
      break;
    case 'events':
      current = userStats.events || 0;
      break;
    case 'membership':
      current = userStats.membershipCount || 0;
      break;
    case 'influence':
      current = userStats.trendingPosts || 0;
      break;
    case 'special':
      current = userStats.helpfulReactions || 0;
      break;
  }
  
  const percentage = Math.min((current / nextRequirement) * 100, 100);
  
  return {
    current: current,
    total: nextRequirement,
    percentage: percentage
  };
};

// 다음 뱃지까지의 진행률 계산 (호환성 유지)
export const getNextBadgeProgress = (userStats) => {
  const categories = calculateUserBadges(userStats);
  const nextCategory = categories.find(cat => cat.currentLevel < 3);
  
  if (!nextCategory) return null;
  
  const nextLevel = nextCategory.currentLevel + 1;
  const nextBadge = nextCategory.levels[nextLevel - 1];
  
  return {
    badge: {
      ...nextBadge,
      icon: nextCategory.icon,
      color: nextCategory.color
    },
    progress: nextCategory.progress.percentage,
    current: nextCategory.progress.current,
    required: nextCategory.progress.total
  };
};
