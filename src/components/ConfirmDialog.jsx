import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

/**
 * Reusable confirmation modal — same API as before, now uses the new design system.
 *
 * Props:
 *   open               - whether dialog is visible
 *   title              - heading text
 *   message            - body text (string or node)
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
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && (
        <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: "var(--leading-normal)" }}>
          {message}
        </p>
      )}
      {requireReason && (
        <div style={{ marginTop: message ? "var(--space-4)" : 0 }}>
          <Textarea
            label="Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            disabled={busy}
            error={error || undefined}
            autoFocus
          />
        </div>
      )}
    </Modal>
  );
}
