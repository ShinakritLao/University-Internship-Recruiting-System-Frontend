import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

export function Input({
  label,
  hint,
  error,
  required = false,
  leadingIcon = null,
  trailingIcon = null,
  className = "",
  id,
  ...rest
}) {
  const reactId = useId();
  const inputId = id || reactId;
  const hasError = Boolean(error);
  const inputClass = [
    "ui-input",
    hasError ? "ui-input--error" : "",
    leadingIcon ? "ui-input--has-leading-icon" : "",
    trailingIcon ? "ui-input--has-trailing-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const input = (
    <input
      id={inputId}
      className={inputClass}
      aria-invalid={hasError || undefined}
      aria-describedby={hint || error ? `${inputId}-help` : undefined}
      {...rest}
    />
  );

  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={inputId} className="ui-field__label">
          {label}
          {required && <span className="ui-field__required">*</span>}
        </label>
      )}
      {leadingIcon || trailingIcon ? (
        <div className="ui-input-group">
          {leadingIcon && (
            <span className="ui-input-group__icon">{leadingIcon}</span>
          )}
          {input}
          {trailingIcon && (
            <span className="ui-input-group__icon ui-input-group__icon--right">
              {trailingIcon}
            </span>
          )}
        </div>
      ) : (
        input
      )}
      {hasError ? (
        <span id={`${inputId}-help`} className="ui-field__error">
          <AlertCircle size={12} />
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-help`} className="ui-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
