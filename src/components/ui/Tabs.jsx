import React from "react";

export function Tabs({ value, onChange, items = [], className = "" }) {
  return (
    <div className={`ui-tabs ${className}`} role="tablist">
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`ui-tab ${isActive ? "ui-tab--active" : ""}`}
            onClick={() => onChange?.(item.value)}
          >
            {item.icon}
            {item.label}
            {item.badge != null && item.badge !== 0 && (
              <span style={{
                marginLeft: 2,
                background: isActive ? "var(--color-accent-500)" : "var(--color-neutral-300)",
                color: isActive ? "var(--color-text-inverse)" : "var(--color-text)",
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "var(--radius-full)",
                minWidth: 18,
                textAlign: "center",
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
