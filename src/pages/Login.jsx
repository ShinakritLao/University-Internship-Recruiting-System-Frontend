import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { saveAuth } from "../services/auth";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError("Please enter email");
      return false;
    }
    if (!userID.trim()) {
      setError("Please enter user ID");
      return false;
    }
    if (!password.trim()) {
      setError("Please enter password");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await login({
        email,
        password,
        userId: userID
      });

      console.log("Login response:", res);

      if (res.token) {
        saveAuth({
          token: res.token,
          role: res.role || "student",
          email,
          firstName: res.firstName
        });
        alert("Login success!");
        
        // Redirect ตามโรล
        const role = res.role || "student";
        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "company") {
          navigate("/company-dashboard");
        } else if (role === "staff") {
          navigate("/staff-dashboard");
        }
      } else if (res.error) {
        setError(res.error);
      } else {
        setError("Login failed: " + JSON.stringify(res));
      }
    } catch (err) {
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        
        <input
          type="text"
          placeholder="User ID"
          value={userID}
          onChange={e => setUserID(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="auth-link">
          <Link to="/reset-password">Forgot password?</Link>
        </p>

        <p className="auth-link">
          Don't have account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}