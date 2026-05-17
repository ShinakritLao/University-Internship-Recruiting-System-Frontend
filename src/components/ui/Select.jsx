import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

export function Select({
  label,
  hint,
  error,
  required = false,
  options = [],
  placeholder,
  className = "",
  id,
  children,
  ...rest
}) {
  const reactId = useId();
  const selectId = id || reactId;
  const hasError = Boolean(error);
  const selectClass = [
    "ui-select",
    hasError ? "ui-select--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={selectId} className="ui-field__label">
          {label}
          {required && <span className="ui-field__required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={selectClass}
        aria-invalid={hasError || undefined}
        aria-describedby={hint || error ? `${selectId}-help` : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ??
          options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>{opt}</option>
            ) : (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )
          )}
      </select>
      {hasError ? (
        <span id={`${selectId}-help`} className="ui-field__error">
          <AlertCircle size={12} />
          {error}
        </span>
      ) : hint ? (
        <span id={`${selectId}-help`} className="ui-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
