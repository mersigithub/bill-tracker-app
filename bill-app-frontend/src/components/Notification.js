import React, { useEffect, useState } from 'react';
import './Notification.css';

const NotificationCenter = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  // Ask for permission and simulate notification
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const timer = setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        message: '⏰ Don’t forget to upload your monthly invoice!',
        read: false,
        important: true
      };

      setNotifications(prev => [newNotification, ...prev]);

      if (Notification.permission === 'granted') {
        new Notification('Reminder', {
          body: newNotification.message,
          icon: '/bell-icon.png',
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Toggle dropdown
  const handleBellClick = () => {
    setShowNotifications(prev => !prev);
  };

  // Mark as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="notification-container">
      {/* Bell Icon with Count */}
      <div className="notification-bell" onClick={handleBellClick}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>

      {/* Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notification-header">
            <strong>Notifications</strong>
          </div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications</div>
          ) : (
            <div className="notification-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`notification-item 
                    ${notification.read ? '' : 'unread'} 
                    ${notification.important ? 'important' : ''}`}
                >
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-meta">
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
