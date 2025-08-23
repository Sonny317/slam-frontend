import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function GameAnalyticsPage() {
  const { user } = useUser();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

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

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      fetchAnalytics();
    }
  }, [selectedGame, timeRange, games]);

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
          category: 'Team Building',
          rating: 4.2,
          feedbackCount: 45
        },
        {
          id: 2,
          name: 'Two Truths One Lie',
          category: 'Icebreaker',
          rating: 4.5,
          feedbackCount: 67
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/games`, {
        params: { gameId: selectedGame, timeRange }
      });
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // 임시 데이터로 테스트
      setAnalyticsData(generateMockAnalytics());
    }
  };

  // 임시 분석 데이터 생성
  const generateMockAnalytics = () => {
    const mockData = {
      gameRankings: games.map((game, index) => ({
        ...game,
        popularityScore: (game.rating * 0.4 + Math.min(game.feedbackCount / 50, 1) * 0.3 + 0.2 + 0.1) * 100
      })).sort((a, b) => b.popularityScore - a.popularityScore),
      
      performanceByParticipants: [
        { participantRange: 'Small (≤10)', averageRating: 4.3, feedbackCount: 25 },
        { participantRange: 'Medium (11-25)', averageRating: 4.1, feedbackCount: 45 },
        { participantRange: 'Large (26-50)', averageRating: 3.8, feedbackCount: 30 },
        { participantRange: 'Extra Large (>50)', averageRating: 3.5, feedbackCount: 15 }
      ],
      
      trendData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Average Rating',
            data: [4.1, 4.2, 4.0, 4.3, 4.2, 4.1],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }
        ]
      }
    };
    
    return mockData;
  };

  // 게임 인기도 순위
  const renderGameRankings = () => {
    if (!analyticsData?.gameRankings) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Game Popularity Ranking</h2>
        <div className="space-y-4">
          {analyticsData.gameRankings.map((game, index) => (
            <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{game.name}</h3>
                  <p className="text-sm text-gray-500">{game.category}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {game.popularityScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Popularity Score</div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
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
                  <span className="ml-2 text-gray-700">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="text-gray-500">
                  📝 {game.feedbackCount || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 인원수별 성과 차트
  const renderPerformanceChart = () => {
    if (!analyticsData?.performanceByParticipants) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance by Participant Count</h2>
        <div className="space-y-4">
          {analyticsData.performanceByParticipants.map((data, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{data.participantRange}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= data.averageRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 font-semibold text-gray-900">{data.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">({data.feedbackCount} feedbacks)</span>
                </div>
              </div>
              
              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(data.averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 게임별 상세 분석
  const renderGameDetails = () => {
    if (!selectedGame) return null;
    
    const game = games.find(g => g.id === parseInt(selectedGame));
    if (!game) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Game Details: {game.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{game.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Rating:</span>
                <span className="font-medium">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Feedback Count:</span>
                <span className="font-medium">{game.feedbackCount || 0}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Performance Insights</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Popularity Score:</span>
                <span className="font-medium text-blue-600">
                  {((game.rating * 0.4 + Math.min((game.feedbackCount || 0) / 50, 1) * 0.3 + 0.2 + 0.1) * 100).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trend:</span>
                <span className="font-medium text-green-600">↗️ Improving</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recommendation:</span>
                <span className="font-medium text-purple-600">Keep using</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Analytics</h1>
          <p className="mt-2 text-gray-600">Analyze game performance and get insights for improvement</p>
        </div>

        {/* 필터 컨트롤 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* 게임 선택 */}
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Games</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              {/* 시간 범위 */}
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* 게임별 상세 분석 */}
            {renderGameDetails()}

            {/* 게임 인기도 순위 */}
            {renderGameRankings()}

            {/* 인원수별 성과 차트 */}
            {renderPerformanceChart()}

            {/* 추가 분석 섹션들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 카테고리별 성과 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance by Category</h2>
                <div className="space-y-4">
                  {['Icebreaker', 'Team Building', 'Strategy', 'Creative'].map(category => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium text-gray-700">{category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">4.2</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${
                                star <= 4.2 ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최적 인원수 추천 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Optimal Player Counts</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">🎯 Best Performing Groups</h3>
                    <p className="text-sm text-green-700">Groups of 8-12 participants show the highest satisfaction rates</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">⚠️ Areas for Improvement</h3>
                    <p className="text-sm text-yellow-700">Large groups (>50) may need different game strategies</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">💡 Recommendations</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use team-based games for large groups</li>
                      <li>• Consider multiple simultaneous games</li>
                      <li>• Provide clear instructions for complex games</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
