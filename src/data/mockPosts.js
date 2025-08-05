// src/data/mockPosts.js

// ✅ 고정 게시물 데이터 (SLAM 공식 가이드)
const pinnedPosts = [
  {
    id: 101,
    category: 'Taipei Tips',
    title: "The Ultimate SLAM Guide to Taipei's Best Eats & Bars",
    author: "SLAM Staff",
    date: "2025-07-20",
    views: 999,
    isPinned: true,
    summary: "Don't know where to go? We've got you covered. Here's a curated list of our favorite spots in Taipei.",
    content: "Welcome to our comprehensive guide to Taipei's best dining and nightlife spots! This guide is curated by our SLAM team and includes our personal favorites."
  },
  {
    id: 102,
    category: 'Travel Recs',
    title: "AI-Planned: The Perfect 1-Night, 2-Day Trip to Yilan",
    author: "SLAM AI Assistant",
    date: "2025-07-19",
    views: 1250,
    isPinned: true,
    summary: "Pack your bags! Here is a ready-to-go itinerary for a refreshing weekend trip to Toucheng and Yilan, created by our AI.",
    content: "Ready for a weekend getaway? Our AI has planned the perfect trip to Yilan for you. This itinerary includes the best spots for food, nature, and relaxation."
  },
];

// ✅ 사용자가 작성한 게시물은 localStorage에서 가져옵니다.
const getUserPosts = () => {
  try {
    return JSON.parse(localStorage.getItem('communityPosts') || '[]');
  } catch (error) {
    console.error('Error loading user posts:', error);
    return [];
  }
};

// ✅ 고정 게시물과 사용자 게시물을 합쳐서 export 합니다.
export const mockPosts = [...pinnedPosts, ...getUserPosts()];