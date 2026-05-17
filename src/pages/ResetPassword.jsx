import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Hash, Lock, Eye, EyeOff, AlertCircle, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "../services/api";
import {
  isStrongPassword,
  passwordRequirementsMessage,
} from "../services/validation";
import { AuthLayout } from "../components/layout";
import { Input, Button } from "../components/ui";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Please enter your email.";
    if (!email.includes("@")) return "Please enter a valid email.";
    if (!userID.trim()) return "Please enter your user ID.";
    if (!newPassword.trim()) return "Please enter a new password.";
    if (!isStrongPassword(newPassword)) return passwordRequirementsMessage();
    if (newPassword !== confirmPassword) return "Passwords do not match.";
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
      const res = await resetPassword({
        email,
        userId: userID,
        newPassword,
      });

      if (res?.message) {
        toast.success("Password updated. Please sign in.");
        navigate("/login");
      } else {
        setError(res?.error || "Reset failed. Please try again.");
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Verify your identity and choose a new password."
    >
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
          required
          placeholder="you@university.ac.th"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          leadingIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <Input
          label="User ID"
          required
          placeholder="Institutional ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          disabled={loading}
          leadingIcon={<Hash size={16} />}
          autoComplete="username"
        />

        <Input
          label="New password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Create a strong password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          label="Confirm new password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          leadingIcon={!loading && <KeyRound size={16} />}
        >
          {loading ? "Updating..." : "Update password"}
        </Button>

        <div className="auth-form-foot">
          <span>
            Remembered your password? <Link to="/login">Sign in</Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
