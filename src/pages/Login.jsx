import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Hash, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { login } from "../services/api";
import { saveAuth } from "../services/auth";
import { AuthLayout } from "../components/layout";
import { Input, Button } from "../components/ui";

const DASHBOARD_BY_ROLE = {
  student: "/student-dashboard",
  company: "/company-dashboard",
  staff: "/staff-dashboard",
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Please enter your email.";
    if (!userID.trim()) return "Please enter your user ID.";
    if (!password.trim()) return "Please enter your password.";
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
      const res = await login({ email, password, userId: userID });

      if (res?.token) {
        const role = res.role || "student";
        saveAuth({
          token: res.token,
          role,
          email,
          firstName: res.firstName,
        });
        toast.success(`Welcome back, ${res.firstName || "there"}!`);
        navigate(DASHBOARD_BY_ROLE[role] || "/student-dashboard");
      } else {
        setError(res?.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard.">
      <form className="auth-form-stack" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-form-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.ac.th"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          leadingIcon={<Mail size={16} />}
        />

        <Input
          label="User ID"
          type="text"
          autoComplete="username"
          required
          placeholder="Institutional ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          disabled={loading}
          leadingIcon={<Hash size={16} />}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          leadingIcon={<Lock size={16} />}
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
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          leadingIcon={!loading && <LogIn size={16} />}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="auth-form-foot">
          <Link to="/reset-password">Forgot your password?</Link>
          <span>
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
