import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    const handleNotification = (notif) => {
      // Show instant toast notification
      toast(notif.body || notif.title || 'New notification', {
        icon: '🔔',
        duration: 4000,
      });
      fetchNotifications();
    };

    socket.on('notification', handleNotification);
    socket.on('announcement', (announcement) => {
      toast(`📢 Announcement: ${announcement.title}`, {
        icon: '📢',
        duration: 6000,
      });
      fetchNotifications();
    });

    return () => {
      socket.off('notification', handleNotification);
      socket.off('announcement');
    };
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-ink dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-heading font-bold text-ink dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted text-xs">
                No notifications yet. You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                  className={`p-3 text-left transition-colors cursor-pointer flex gap-3 ${
                    n.isRead
                      ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      : 'bg-primary-50/40 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40'
                  }`}
                >
                  <div className="mt-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        n.isRead ? 'bg-transparent' : 'bg-accent-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink dark:text-white leading-tight mb-0.5">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted dark:text-gray-400 line-clamp-2">
                      {n.body}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-primary-600 dark:text-primary-400 font-medium hover:underline inline-flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
