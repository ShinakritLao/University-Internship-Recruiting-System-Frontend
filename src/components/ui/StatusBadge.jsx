import React from "react";
import { Badge } from "./Badge";

/**
 * Domain-aware badge. Maps any backend status string to a tone + display label.
 * Covers MOU, Internship, and Application state machines.
 */
const STATUS_MAP = {
  // application + generic
  submitted:      { tone: "info",    label: "Submitted" },
  "under-review": { tone: "warning", label: "Under review" },
  accepted:       { tone: "success", label: "Accepted" },
  rejected:       { tone: "danger",  label: "Rejected" },
  confirmed:      { tone: "success", label: "Confirmed" },
  withdrawn:      { tone: "neutral", label: "Withdrawn" },
  // mou + internship
  pending:        { tone: "warning", label: "Pending" },
  approved:       { tone: "success", label: "Approved" },
  expired:        { tone: "neutral", label: "Expired" },
  // misc
  draft:          { tone: "neutral", label: "Draft" },
  active:         { tone: "success", label: "Active" },
};

export function StatusBadge({ status, dot = true, className = "" }) {
  if (!status) return null;
  const key = String(status).toLowerCase().trim();
  const entry = STATUS_MAP[key] ?? {
    tone: "neutral",
    label: String(status),
  };
  return (
    <Badge tone={entry.tone} dot={dot} className={className}>
      {entry.label}
    </Badge>
  );
}
