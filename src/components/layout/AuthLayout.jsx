import React from "react";
import { GraduationCap, Check } from "lucide-react";
import "./auth-layout.css";

const DEFAULT_HIGHLIGHTS = [
  "Browse staff-approved internship postings",
  "Track applications in real time",
  "Confirm offers before the June 30 deadline",
];

/**
 * AuthLayout — split panel shell used by Login, Register, ResetPassword.
 *
 * Props:
 *   - title:       form headline (e.g. "Welcome back")
 *   - subtitle:    form sub-headline
 *   - wide?:       widen the form column for multi-field forms (e.g. Register)
 *   - brandTitle:  hero headline on the left panel (overridable)
 *   - brandLead:   supporting copy under the hero
 *   - highlights:  feature list bullets
 *   - children:    the form content
 */
export function AuthLayout({
  title,
  subtitle,
  wide = false,
  brandTitle,
  brandLead,
  highlights = DEFAULT_HIGHLIGHTS,
  children,
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand__top">
          <div className="auth-brand__mark">
            <span className="auth-brand__mark-icon">
              <GraduationCap size={20} strokeWidth={2.4} />
            </span>
            <span className="auth-brand__mark-text">
              <strong>URS</strong>
              <span>University Recruiting System</span>
            </span>
          </div>
        </div>

        <div className="auth-brand__mid">
          <h2 className="auth-brand__headline">
            {brandTitle ?? (
              <>
                Where students meet their <em>first opportunity</em>.
              </>
            )}
          </h2>
          <p className="auth-brand__lead">
            {brandLead ??
              "One place to discover internships, manage applications, and stay aligned with academic deadlines."}
          </p>
          {highlights?.length > 0 && (
            <ul className="auth-brand__list">
              {highlights.map((h) => (
                <li key={h}>
                  <span className="auth-brand__list-check">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="auth-brand__bot">
          <p className="auth-brand__footer">
            CPE 362 · Object Oriented Analysis &amp; Design
          </p>
        </div>
      </aside>

      <section className="auth-form-panel">
        <div className={`auth-form-wrap ${wide ? "auth-form-wrap--wide" : ""}`}>
          <header className="auth-form-header">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
