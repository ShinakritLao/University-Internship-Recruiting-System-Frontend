import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Hash, Lock, Eye, EyeOff, User, AlertCircle, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { register } from "../services/api";
import {
  isStrongPassword,
  passwordRequirementsMessage,
} from "../services/validation";
import { AuthLayout } from "../components/layout";
import { Input, Button } from "../components/ui";

function detectRoleHint(id) {
  const len = id.trim().length;
  if (len === 11) return { role: "Student", tone: "ok" };
  if (len === 8) return { role: "Company", tone: "ok" };
  if (len === 9) return { role: "Staff", tone: "ok" };
  if (len === 0) return null;
  return { role: null, tone: "warn" };
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_id: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!form.first_name.trim()) return "Please enter your first name.";
    if (!form.last_name.trim()) return "Please enter your last name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (!form.user_id.trim()) return "Please enter your user ID.";
    if (!form.password.trim()) return "Please enter a password.";
    if (!isStrongPassword(form.password)) return passwordRequirementsMessage();
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        email: form.email,
        password: form.password,
        firstName: form.first_name,
        lastName: form.last_name,
        userId: form.user_id,
      });

      if (res?.message || res?.status === "success" || res?.id) {
        toast.success("Account created. Please sign in.");
        navigate("/login");
      } else {
        setError(res?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const roleHint = detectRoleHint(form.user_id);
  const userIdHint = roleHint
    ? roleHint.role
      ? `Detected role: ${roleHint.role}`
      : "ID length should be 8 (company), 9 (staff), or 11 (student)."
    : "Your role is detected from your institutional ID length.";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the platform to discover and manage internships."
      wide
    >
      <form className="auth-form-stack" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-form-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-form-row">
          <Input
            label="First name"
            required
            placeholder="Jane"
            value={form.first_name}
            onChange={set("first_name")}
            disabled={loading}
            leadingIcon={<User size={16} />}
            autoComplete="given-name"
          />
          <Input
            label="Last name"
            required
            placeholder="Doe"
            value={form.last_name}
            onChange={set("last_name")}
            disabled={loading}
            leadingIcon={<User size={16} />}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          type="email"
          required
          placeholder="you@university.ac.th"
          value={form.email}
          onChange={set("email")}
          disabled={loading}
          leadingIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <Input
          label="User ID"
          required
          placeholder="Institutional ID"
          value={form.user_id}
          onChange={set("user_id")}
          disabled={loading}
          leadingIcon={<Hash size={16} />}
          hint={userIdHint}
          autoComplete="username"
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Create a strong password"
          value={form.password}
          onChange={set("password")}
          disabled={loading}
          leadingIcon={<Lock size={16} />}
          hint="At least 8 characters, with 1 uppercase letter and 1 number."
          trailingIcon={
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="new-password"
        />

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Re-enter your password"
          value={form.confirm_password}
          onChange={set("confirm_password")}
          disabled={loading}
          leadingIcon={<Lock size={16} />}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          leadingIcon={!loading && <UserPlus size={16} />}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <div className="auth-form-foot">
          <span>
            Already have an account? <Link to="/login">Sign in</Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
