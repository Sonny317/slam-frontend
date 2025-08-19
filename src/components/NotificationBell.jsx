// src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function NotificationBell() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchNotifications();
      // 30초마다 알림 체크
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.isLoggedIn]);

  const fetchNotifications = async () => {
    if (!user?.isLoggedIn) return;
    
    try {
      const response = await axios.get('/api/notifications');
      const notifs = response.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      // 404 에러나 500 에러는 조용히 처리 (백엔드 미구현 또는 DB 연결 오류 시)
      if (error.response?.status === 404) {
        console.warn('Notification API not implemented yet');
        setNotifications([]);
        setUnreadCount(0);
      } else if (error.response?.status === 500) {
        console.warn('Notification service temporarily unavailable');
        setNotifications([]);
        setUnreadCount(0);
      } else if (error.response?.status === 401) {
        console.warn('Authentication required for notifications');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch notifications:', error);
        // 다른 오류의 경우에도 빈 상태로 설정
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'membership_approved':
        return '🎉';
      case 'membership_rejected':
        return '❌';
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'event_reminder':
        return '📅';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'membership_approved':
        return `Your ${notification.data?.branch} membership has been approved!`;
      case 'membership_rejected':
        return `Your ${notification.data?.branch} membership application was not approved.`;
      case 'comment':
        return `${notification.data?.author} commented on your post: "${notification.data?.postTitle}"`;
      case 'like':
        return `${notification.data?.author} liked your ${notification.data?.targetType}`;
      case 'event_reminder':
        return `Reminder: "${notification.data?.eventTitle}" starts in 1 hour`;
      default:
        return notification.message || 'You have a new notification';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user?.isLoggedIn) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a8.38 8.38 0 00.5-3c0-4.418-4.03-8-9-8s-9 3.582-9 8a8.38 8.38 0 00.5 3L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    setShowDropdown(false);
                    // Handle navigation based on notification type
                    if (notification.data?.postId) {
                      window.location.href = `/community/post/${notification.data.postId}`;
                    } else if (notification.data?.eventId) {
                      window.location.href = `/events/${notification.data.eventId}`;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
}
