import React from "react";

export function Card({ interactive = false, className = "", children, ...rest }) {
  const classes = [
    "ui-card",
    interactive ? "ui-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`ui-card__header ${className}`}>
      {children ?? (
        <div>
          {title && <h3 className="ui-card__title">{title}</h3>}
          {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
        </div>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`ui-card__body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`ui-card__footer ${className}`}>{children}</div>;
}
