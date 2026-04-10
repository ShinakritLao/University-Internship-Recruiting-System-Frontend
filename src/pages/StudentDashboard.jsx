import { useNavigate } from "react-router-dom";
import { clearAuth, getEmail } from "../services/auth";
import "../styles/dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const email = getEmail() || "Student";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="header-info">
          <span className="role-badge">Student</span>
          <span className="email-info">{email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {email}!</h2>
        <p>Browse internship opportunities and apply for positions.</p>
        
        <div className="dashboard-section">
          <h3>Available Features</h3>
          <ul>
            <li>View internship postings</li>
            <li>Apply for positions</li>
            <li>Track application status</li>
            <li>View profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
