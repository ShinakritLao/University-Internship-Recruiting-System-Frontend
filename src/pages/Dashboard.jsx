import { useNavigate } from "react-router-dom";
import { clearAuth, getEmail } from "../services/auth";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const email = getEmail() || "User";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {email}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <p>You are successfully logged in.</p>
      </div>
    </div>
  );
}
