import React from "react";

const VARIANTS = ["primary", "secondary", "ghost", "danger", "outline"];
const SIZES = ["sm", "md", "lg"];

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leadingIcon = null,
  trailingIcon = null,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const v = VARIANTS.includes(variant) ? variant : "primary";
  const s = SIZES.includes(size) ? size : "md";
  const classes = [
    "ui-btn",
    `ui-btn--${v}`,
    `ui-btn--${s}`,
    fullWidth ? "ui-btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="ui-btn__spinner" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}
