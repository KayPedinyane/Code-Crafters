import React from 'react';
import './NotificationPanel.css';

const TYPE_CONFIG = {
  application: { icon: '👤', label: 'Application' },
  status:      { icon: '📋', label: 'Status Update' },
  approval:    { icon: '✅', label: 'Approval' },
  rejection:   { icon: '❌', label: 'Rejected' },
  system:      { icon: '🔔', label: 'System' },
};

function getType(message = '') {
  const m = message.toLowerCase();
  if (m.includes('applied') || m.includes('application')) return 'application';
  if (m.includes('approved') || m.includes('accepted'))   return 'approval';
  if (m.includes('rejected') || m.includes('declined'))   return 'rejection';
  if (m.includes('status'))                               return 'status';
  return 'system';
}

function groupByDate(notifications) {
  const groups = {};
  notifications.forEach(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString())         label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

export default function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const grouped = groupByDate(notifications);

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="notif-panel-header">
          <div className="notif-panel-title-row">
            <h2 className="notif-panel-title">
              Notifications
              {unreadCount > 0 && (
                <span className="notif-badge-count">{unreadCount}</span>
              )}
            </h2>
            <button className="notif-panel-close" onClick={onClose}>✕</button>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={onMarkAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="notif-panel-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-state">
              <span className="notif-empty-icon">🔔</span>
              <p className="notif-empty-title">No notifications yet</p>
              <p className="notif-empty-sub">We'll let you know when something happens.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="notif-group">
                <div className="notif-group-label">{date}</div>
                {items.map(notif => {
                  const type = getType(notif.message);
                  const config = TYPE_CONFIG[type];
                  return (
                    <div
                      key={notif.id}
                      className={`notif-item-enhanced ${!notif.is_read ? 'notif-item-unread' : ''}`}
                      onClick={() => !notif.is_read && onMarkRead(notif.id)}
                    >
                      <div className={`notif-type-icon notif-type-${type}`}>
                        {config.icon}
                      </div>
                      <div className="notif-item-body">
                        <p className="notif-item-message">{notif.message}</p>
                        <div className="notif-item-meta">
                          <span className={`notif-type-tag notif-type-tag-${type}`}>
                            {config.label}
                          </span>
                          <time className="notif-item-time">{timeAgo(notif.created_at)}</time>
                        </div>
                      </div>
                      {!notif.is_read && <div className="notif-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
