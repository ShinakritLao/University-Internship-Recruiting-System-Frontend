import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/api";
import { isStrongPassword, passwordRequirementsMessage } from "../services/validation";
import "../styles/auth.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError("Please enter email");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (!userID.trim()) {
      setError("Please enter user ID");
      return false;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return false;
    }
    if (!isStrongPassword(newPassword)) {
      setError(passwordRequirementsMessage());
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await resetPassword({
        email,
        userId: userID,
        newPassword
      });

      if (res.message) {
        alert("Password successfully updated. Please login.");
        navigate("/login");
      } else if (res.error) {
        setError(res.error);
      } else {
        setError("Reset password failed: " + JSON.stringify(res));
      }
    } catch (err) {
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleResetPassword();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Password</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <input
          type="text"
          placeholder="User ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <button onClick={handleResetPassword} disabled={loading}>
          {loading ? "Loading..." : "Reset Password"}
        </button>

        <p className="auth-link">
          Remembered your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
