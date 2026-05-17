import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

export function NotificationBell({ items = [], onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const unreadCount = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0 && onMarkAllRead) {
      onMarkAllRead();
    }
  };

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="notif-bell__button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-bell__dot">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-bell__panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="notif-bell__panel-header">
              <span className="notif-bell__panel-title">Notifications</span>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  type="button"
                  className="notif-bell__mark-all"
                  onClick={onMarkAllRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="notif-bell__panel-body">
              {items.length === 0 ? (
                <div className="notif-bell__panel-empty">
                  You're all caught up.
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.is_read ? "" : "notif-item--unread"}`}
                    onClick={() => !n.is_read && onMarkRead?.(n.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span
                      className={`notif-item__dot ${n.is_read ? "notif-item__dot--read" : ""}`}
                      aria-hidden="true"
                    />
                    <div className="notif-item__content">
                      <p className="notif-item__message">{n.message}</p>
                      <div className="notif-item__time">{formatTime(n.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
