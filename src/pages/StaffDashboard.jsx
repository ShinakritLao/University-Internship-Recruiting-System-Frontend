import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "Staff";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <div className="header-info">
          <span className="role-badge">Staff</span>
          <span className="email-info">{email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {email}!</h2>
        <p>Manage system users and oversee all internship activities.</p>
        
        <div className="dashboard-section">
          <h3>Available Features</h3>
          <ul>
            <li>Manage users</li>
            <li>Review all postings</li>
            <li>Monitor applications</li>
            <li>Generate reports</li>
            <li>System settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
