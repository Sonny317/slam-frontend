import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

// 게임 카테고리 옵션
const GAME_CATEGORIES = [
  'Icebreaker',
  'Team Building',
  'Strategy',
  'Creative',
  'Physical Activity',
  'Communication',
  'Problem Solving',
  'Social',
  'Educational',
  'Entertainment'
];

// 난이도 옵션
const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', color: 'text-red-600' }
];

export default function AdminGamesPage() {
  const { user } = useUser();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('games'); // 'games' or 'analytics'

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    videoUrl: '',
    category: '',
    minPlayers: 2,
    maxPlayers: 20,
    optimalPlayers: '',
    difficultyLevel: 'medium',
    durationMinutes: ''
  });

  // 권한 확인
  if (!user?.isLoggedIn || !['ADMIN', 'PRESIDENT'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // 게임 목록 가져오기
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/games');
      setGames(response.data || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      // 임시 데이터로 테스트
      setGames([
        {
          id: 1,
          name: 'Human Knot',
          description: 'A classic team building game where participants form a human knot and try to untangle themselves.',
          category: 'Team Building',
          minPlayers: 6,
          maxPlayers: 20,
          optimalPlayers: '8-12',
          difficultyLevel: 'medium',
          durationMinutes: 15,
          rating: 4.2,
          feedbackCount: 45
        },
        {
          id: 2,
          name: 'Two Truths One Lie',
          description: 'Each person shares three statements about themselves, two true and one false.',
          category: 'Icebreaker',
          minPlayers: 3,
          maxPlayers: 30,
          optimalPlayers: '5-15',
          difficultyLevel: 'easy',
          durationMinutes: 10,
          rating: 4.5,
          feedbackCount: 67
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 폼 데이터 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      instructions: '',
      videoUrl: '',
      category: '',
      minPlayers: 2,
      maxPlayers: 20,
      optimalPlayers: '',
      difficultyLevel: 'medium',
      durationMinutes: ''
    });
    setEditingGame(null);
  };

  // 게임 생성/수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingGame) {
        // 게임 수정
        await axios.put(`/api/admin/games/${editingGame.id}`, formData);
        alert('Game updated successfully!');
      } else {
        // 게임 생성
        await axios.post('/api/admin/games', formData);
        alert('Game created successfully!');
      }
      
      resetForm();
      setShowCreateForm(false);
      fetchGames();
    } catch (error) {
      alert('Failed to save game: ' + (error.response?.data?.message || error.message));
    }
  };

  // 게임 삭제
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await axios.delete(`/api/admin/games/${gameId}`);
      alert('Game deleted successfully!');
      fetchGames();
    } catch (error) {
      alert('Failed to delete game: ' + (error.response?.data?.message || error.message));
    }
  };

  // 게임 편집 모드 시작
  const handleEditGame = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || '',
      instructions: game.instructions || '',
      videoUrl: game.videoUrl || '',
      category: game.category || '',
      minPlayers: game.minPlayers || 2,
      maxPlayers: game.maxPlayers || 20,
      optimalPlayers: game.optimalPlayers || '',
      difficultyLevel: game.difficultyLevel || 'medium',
      durationMinutes: game.durationMinutes || ''
    });
    setShowCreateForm(true);
  };

  // 필터링된 게임 목록
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 게임 통계 계산
  const getGameStats = () => {
    if (games.length === 0) return { totalGames: 0, avgRating: 0, totalFeedback: 0 };
    
    const totalGames = games.length;
    const totalFeedback = games.reduce((sum, game) => sum + (game.feedbackCount || 0), 0);
    const gamesWithRating = games.filter(game => game.rating);
    const avgRating = gamesWithRating.length > 0 
      ? gamesWithRating.reduce((sum, game) => sum + game.rating, 0) / gamesWithRating.length 
      : 0;
    
    return { totalGames, avgRating: avgRating.toFixed(1), totalFeedback };
  };

  const stats = getGameStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Management</h1>
          <p className="mt-2 text-gray-600">Create, edit, and manage games for SLAM events</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex gap-6">
            <button 
              onClick={() => setActiveTab('games')} 
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'games' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              🎮 Game List
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              🎯 Game Analytics
            </button>
          </nav>
        </div>

        {/* 통계 카드 */}
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Games</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalGames}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.118 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Rating</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.avgRating}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Feedback</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalFeedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 컨트롤 바 */}
        {activeTab === 'games' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* 검색 */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* 카테고리 필터 */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {GAME_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 새 게임 생성 버튼 */}
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Game
              </button>
            </div>
          </div>
        )}

        {/* 게임 목록 */}
        {activeTab === 'games' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading games...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGames.map(game => (
                        <tr key={game.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{game.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{game.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {game.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {game.minPlayers}-{game.maxPlayers}
                            {game.optimalPlayers && (
                              <div className="text-xs text-gray-500">Optimal: {game.optimalPlayers}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {game.durationMinutes} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= (game.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-900">
                                {game.rating ? game.rating.toFixed(1) : 'N/A'}
                              </span>
                              <span className="ml-1 text-xs text-gray-500">
                                ({game.feedbackCount || 0})
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditGame(game)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteGame(game.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredGames.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No games found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedCategory ? 'Try adjusting your search or filter.' : 'Get started by creating a new game.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 게임 생성/수정 모달 */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingGame ? 'Edit Game' : 'Create New Game'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Game Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Human Knot, Two Truths One Lie"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Category</option>
                        {GAME_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 참가자 수 및 난이도 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Players
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.minPlayers}
                        onChange={(e) => setFormData({...formData, minPlayers: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Players
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optimal Players
                      </label>
                      <input
                        type="text"
                        value={formData.optimalPlayers}
                        onChange={(e) => setFormData({...formData, optimalPlayers: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 8-12"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={formData.difficultyLevel}
                        onChange={(e) => setFormData({...formData, difficultyLevel: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {DIFFICULTY_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 소요 시간 및 영상 링크 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 15-20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="YouTube, Vimeo, or other video platform URL"
                      />
                    </div>
                  </div>

                  {/* 게임 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of what the game is about..."
                    />
                  </div>

                  {/* 게임 방법 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How to Play (Instructions)
                    </label>
                    <textarea
                      rows="6"
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Step-by-step instructions on how to play the game..."
                    />
                  </div>

                  {/* 버튼 */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingGame ? 'Update Game' : 'Create Game'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

                {/* Game Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🎯 Game Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Performance analysis and insights for your games</p>
            </div>
            <div className="p-6">
              {/* Popularity Ranking */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Popularity Ranking</h3>
                <div className="space-y-3">
                  {filteredGames
                    .filter(game => game.rating)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((game, index) => (
                      <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-medium text-gray-900">{game.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({game.category})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{game.rating?.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-500">({game.feedbackCount || 0} reviews)</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Performance by Player Count */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Performance by Player Count</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Small Group (2-5)', 'Medium Group (6-15)', 'Large Group (16+)'].map((group, index) => {
                    const gamesInGroup = filteredGames.filter(game => {
                      if (group.includes('Small')) return game.maxPlayers && game.maxPlayers <= 5;
                      if (group.includes('Medium')) return game.maxPlayers && game.maxPlayers > 5 && game.maxPlayers <= 15;
                      if (group.includes('Large')) return game.maxPlayers && game.maxPlayers > 15;
                      return false;
                    });
                     
                    const avgRating = gamesInGroup.length > 0 
                      ? gamesInGroup.reduce((sum, game) => sum + (game.rating || 0), 0) / gamesInGroup.length
                      : 0;
                     
                    return (
                      <div key={group} className="p-4 bg-gray-50 rounded-lg text-center">
                        <h4 className="font-medium text-gray-900 mb-2">{group}</h4>
                        <div className="text-2xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
                        <div className="text-sm text-gray-500">avg rating</div>
                        <div className="text-xs text-gray-400 mt-1">{gamesInGroup.length} games</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Category Performance</h3>
                <div className="space-y-3">
                  {GAME_CATEGORIES.map(category => {
                    const gamesInCategory = filteredGames.filter(game => game.category === category);
                    const avgRating = gamesInCategory.length > 0 
                      ? gamesInCategory.reduce((sum, game) => sum + (game.rating || 0), 0) / gamesInCategory.length
                      : 0;
                     
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{avgRating.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-500">({gamesInCategory.length} games)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
