import React from "react";

export function Skeleton({
  width,
  height,
  variant = "rect",
  className = "",
  style = {},
  ...rest
}) {
  const variantClass =
    variant === "text" ? "ui-skeleton--text"
    : variant === "circle" ? "ui-skeleton--circle"
    : "";
  return (
    <span
      className={`ui-skeleton ${variantClass} ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
