// ============================================
// Notification Center — Bell icon + popover
// ============================================
import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { notificationsApi } from '../../api';
import type { Notification } from '../../api';
import '../../styles/notifications.css';

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: '📋',
  TASK_COMPLETED: '✅',
  COMMENT_ADDED: '💬',
  DUE_REMINDER: '⏰',
  WORKSPACE_INVITE: '📩',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount and poll every 30s
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.unreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // Silently fail — notifications might not be available
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Load full list when popover opens
  const openPopover = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const list = await notificationsApi.list();
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePopover = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openPopover();
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.remove(id);
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="notification-center" ref={popoverRef}>
      <button className="notification-bell" onClick={togglePopover} title="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover">
          <div className="notification-popover-header">
            <h4>Notifications</h4>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button
                  className="notification-action-btn"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                className="notification-action-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                <div className="loading-spinner" />
                <span>Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={24} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
                  <span className="notification-type-icon">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="notification-content">
                    <div className="notification-title">{n.title}</div>
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  <div className="notification-item-actions">
                    {!n.read && (
                      <button
                        className="notification-action-btn"
                        onClick={() => handleMarkRead(n.id)}
                        title="Mark as read"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      className="notification-action-btn danger"
                      onClick={() => handleDelete(n.id)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
