import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, GraduationCap } from "lucide-react";
import { clearAuth, getFirstName, getRole } from "../../services/auth";
import { NotificationBell } from "./NotificationBell";

function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * DashboardLayout — sticky sidebar + top bar shell shared by all role dashboards.
 *
 * Props:
 *   - pageTitle / pageSubtitle: shown in the top bar
 *   - nav: [{ value, label, icon, badge? }]
 *   - activeNavItem / onNavChange: controlled selection
 *   - notifications?: { items, onMarkRead, onMarkAllRead } — student-only
 *   - topbarExtra?: ReactNode rendered between page title and bell/user
 *   - children: page content
 */
export function DashboardLayout({
  pageTitle,
  pageSubtitle,
  nav = [],
  activeNavItem,
  onNavChange,
  notifications = null,
  topbarExtra = null,
  children,
}) {
  const navigate = useNavigate();
  const firstName = getFirstName() || "User";
  const role = getRole() || "user";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-mark" aria-hidden="true">
            <GraduationCap size={16} strokeWidth={2.4} />
          </div>
          <div>
            <div className="app-sidebar__brand-text">URS</div>
            <div className="app-sidebar__brand-sub">Recruiting System</div>
          </div>
        </div>

        <nav className="app-sidebar__nav" aria-label="Primary">
          <div className="app-sidebar__nav-label">Menu</div>
          {nav.map((item) => {
            const isActive = item.value === activeNavItem;
            return (
              <button
                key={item.value}
                type="button"
                className={`app-nav-item ${isActive ? "app-nav-item--active" : ""}`}
                onClick={() => onNavChange?.(item.value)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon && (
                  <span className="app-nav-item__icon">{item.icon}</span>
                )}
                <span>{item.label}</span>
                {item.badge != null && item.badge !== 0 && (
                  <span className="app-nav-item__badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="app-sidebar__user">
          <div className="app-user">
            <div className="app-user__avatar" aria-hidden="true">
              {initials(firstName)}
            </div>
            <div className="app-user__info">
              <span className="app-user__name">{firstName}</span>
              <span className="app-user__role">{role}</span>
            </div>
            <button
              type="button"
              className="app-user__logout"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar__title-block">
            {pageTitle && <h1 className="app-topbar__title">{pageTitle}</h1>}
            {pageSubtitle && (
              <p className="app-topbar__subtitle">{pageSubtitle}</p>
            )}
          </div>
          <div className="app-topbar__actions">
            {topbarExtra}
            {notifications && (
              <NotificationBell
                items={notifications.items}
                onMarkRead={notifications.onMarkRead}
                onMarkAllRead={notifications.onMarkAllRead}
              />
            )}
          </div>
        </header>

        <nav className="app-mobile-nav" aria-label="Primary mobile">
          <div className="app-mobile-nav__inner">
            {nav.map((item) => {
              const isActive = item.value === activeNavItem;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`app-mobile-nav__item ${
                    isActive ? "app-mobile-nav__item--active" : ""
                  }`}
                  onClick={() => onNavChange?.(item.value)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge != null && item.badge !== 0 && (
                    <span className="app-mobile-nav__badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
