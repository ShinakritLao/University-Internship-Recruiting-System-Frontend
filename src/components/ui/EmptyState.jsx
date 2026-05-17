import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className = "",
}) {
  return (
    <div className={`ui-empty ${className}`}>
      <div className="ui-empty__icon">{icon ?? <Inbox size={22} />}</div>
      <h3 className="ui-empty__title">{title}</h3>
      {description && <p className="ui-empty__description">{description}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
