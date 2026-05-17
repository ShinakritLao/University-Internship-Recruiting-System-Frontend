import React from "react";

const TONES = ["neutral", "accent", "success", "warning", "danger", "info"];

export function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  const t = TONES.includes(tone) ? tone : "neutral";
  return (
    <span className={`ui-badge ui-badge--${t} ${className}`} {...rest}>
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
