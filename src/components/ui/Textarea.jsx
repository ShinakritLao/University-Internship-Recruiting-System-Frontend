import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

export function Textarea({
  label,
  hint,
  error,
  required = false,
  rows = 4,
  className = "",
  id,
  ...rest
}) {
  const reactId = useId();
  const fieldId = id || reactId;
  const hasError = Boolean(error);
  const taClass = [
    "ui-textarea",
    hasError ? "ui-textarea--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={fieldId} className="ui-field__label">
          {label}
          {required && <span className="ui-field__required">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        className={taClass}
        aria-invalid={hasError || undefined}
        aria-describedby={hint || error ? `${fieldId}-help` : undefined}
        {...rest}
      />
      {hasError ? (
        <span id={`${fieldId}-help`} className="ui-field__error">
          <AlertCircle size={12} />
          {error}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-help`} className="ui-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
