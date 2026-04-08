import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import "../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    user_id: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!form.first_name.trim()) {
      setError("Please enter first name");
      return false;
    }
    if (!form.last_name.trim()) {
      setError("Please enter last name");
      return false;
    }
    if (!form.email.trim()) {
      setError("Please enter email");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Please enter valid email");
      return false;
    }
    if (!form.user_id.trim()) {
      setError("Please enter user ID");
      return false;
    }
    if (!form.password.trim()) {
      setError("Please enter password");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        email: form.email,
        password: form.password,
        firstName: form.first_name,
        lastName: form.last_name,
        userId: form.user_id
      };

      const res = await register(submitData);
      console.log("Register response:", res);

      if (res.message || res.status === "success" || res.id) {
        alert("Register success! Please login");
        navigate("/login");
      } else if (res.error) {
        setError(res.error);
      } else {
        setError("Register failed: " + JSON.stringify(res));
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        
        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="text"
          name="user_id"
          placeholder="User ID"
          value={form.user_id}
          onChange={handleChange}
          disabled={loading}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="auth-link">
          Have account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}