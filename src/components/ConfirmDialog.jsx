import { useEffect, useState } from "react";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   open               - whether dialog is visible
 *   title              - heading text
 *   message            - body text
 *   confirmLabel       - text for confirm button (default "Confirm")
 *   confirmVariant     - "primary" | "danger" (default "primary")
 *   requireReason      - if true, shows a reason textarea; onConfirm receives the reason
 *   reasonPlaceholder  - placeholder for the reason textarea
 *   onConfirm          - (reason?: string) => void | Promise<void>
 *   onCancel           - () => void
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  requireReason = false,
  reasonPlaceholder = "Reason...",
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setBusy(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p className="modal-message">{message}</p>}
        {requireReason && (
          <div className="form-group">
            <label>Reason <span className="required">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={busy}
              autoFocus
            />
            {error && <div className="error-msg">{error}</div>}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            className={confirmVariant === "danger" ? "btn-reject" : "btn-primary"}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
