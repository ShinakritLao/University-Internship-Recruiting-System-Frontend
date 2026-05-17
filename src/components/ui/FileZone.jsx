import React from "react";
import { Upload, FileText, X as XIcon } from "lucide-react";

/**
 * FileZone — styled drag-style file upload control.
 *
 * Props:
 *   label?:    field label
 *   hint?:     helper text shown when no file selected
 *   accept?:   MIME accept attr (default: PDF)
 *   file:      current File or null
 *   onChange:  (File | null) => void
 *   required?: shows red asterisk on label
 *   disabled?: disables interaction
 */
export function FileZone({
  label,
  hint,
  accept = "application/pdf",
  file,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text)",
            marginBottom: 6,
          }}
        >
          {label}
          {required && (
            <span style={{ color: "var(--color-danger-fg)", marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      <div
        className={`file-zone ${file ? "file-zone--has-file" : ""}`}
        style={disabled ? { opacity: 0.6, pointerEvents: "none" } : undefined}
      >
        {!file ? (
          <>
            <div className="file-zone__icon"><Upload size={18} /></div>
            <p className="file-zone__title">Click to upload</p>
            <p className="file-zone__hint">{hint || "PDF, up to 50 MB"}</p>
            <input
              type="file"
              accept={accept}
              className="file-zone__input"
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
          </>
        ) : (
          <>
            <span className="file-zone__filename">
              <FileText size={14} />
              {file.name}
              {file.size != null && (
                <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--weight-regular)", marginLeft: 4 }}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </span>
            <button
              type="button"
              className="file-zone__clear"
              onClick={() => onChange(null)}
              aria-label="Remove file"
              disabled={disabled}
            >
              <XIcon size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
