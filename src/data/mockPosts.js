// src/data/mockPosts.js

// ✅ 새로운 고정 게시물 데이터
const pinnedPosts = [
  {
    id: 101,
    category: 'Taipei Tips',
    title: "The Ultimate SLAM Guide to Taipei's Best Eats & Bars",
    author: "SLAM Staff",
    date: "2025-07-20",
    views: 999,
    isPinned: true, // ✅ 고정 게시물 표시
    summary: "Don't know where to go? We've got you covered. Here's a curated list of our favorite spots in Taipei.",
    imageUrl: "/food_guide_cover.jpg" // 관련 이미지
  },
  {
    id: 102,
    category: 'Travel Recs',
    title: "AI-Planned: The Perfect 1-Night, 2-Day Trip to Yilan",
    author: "SLAM AI Assistant",
    date: "2025-07-19",
    views: 1250,
    isPinned: true, // ✅ 고정 게시물 표시
    summary: "Pack your bags! Here is a ready-to-go itinerary for a refreshing weekend trip to Toucheng and Yilan, created by our AI.",
    imageUrl: "/yilan_trip_cover.jpg" // 관련 이미지
  },
];

const userPosts = [
  // ... 기존에 있던 id: 1, 2, 3 게시물들 ...
];

// ✅ 두 데이터를 합쳐서 export 합니다.
export const mockPosts = [...pinnedPosts, ...userPosts];