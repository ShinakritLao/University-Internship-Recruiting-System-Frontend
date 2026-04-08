import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "Company";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <div className="header-info">
          <span className="role-badge">Company</span>
          <span className="email-info">{email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {email}!</h2>
        <p>Manage your internship postings and review applications.</p>
        
        <div className="dashboard-section">
          <h3>Available Features</h3>
          <ul>
            <li>Create/Edit job postings</li>
            <li>Review applications</li>
            <li>Manage candidates</li>
            <li>View company profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
