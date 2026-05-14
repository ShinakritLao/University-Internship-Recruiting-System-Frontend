import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getEmail, getFirstName } from "../services/auth";
import {
  getApprovedInternships,
  applyForInternship,
  getMyApplications,
  getMyProfile,
} from "../services/api";

import Pagination, { paginate } from "../components/Pagination";
import "../styles/dashboard.css";

const PAGE_SIZE = 5;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const email = getEmail() || "Student";
  const firstName = getFirstName() || email;

  const [activeTab, setActiveTab] = useState("internships");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Browse internships and manage your applications
          </p>
        </div>

        <div className="header-info">
          <span className="role-badge">Student</span>
          <span className="email-info">Welcome, {firstName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "internships" ? "active" : ""}`}
          onClick={() => setActiveTab("internships")}
        >
          Internship Postings
        </button>

        <button
          className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          My Applications
        </button>

        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "internships" && <InternshipsTab />}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Internship Postings Tab
// ─────────────────────────────────────────────────────────────

function InternshipsTab() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);

  const [description, setDescription] = useState("");
  const [cv, setCv] = useState(null);
  const [transcript, setTranscript] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);

    const data = await getApprovedInternships();

    setInternships(Array.isArray(data) ? data : []);

    setLoading(false);
  };

  const handleApply = async () => {
    if (!selected) return;

    setMessage("");

    const formData = new FormData();

    formData.append("description", description);

    if (cv) formData.append("cv", cv);
    if (transcript) formData.append("transcript", transcript);

    setSubmitting(true);

    const res = await applyForInternship(selected.id, formData);

    if (res.error) {
      setMessage(res.error);
    } else {
      setMessage("Application submitted successfully!");
      setDescription("");
      setCv(null);
      setTranscript(null);
      setSelected(null);
    }

    setSubmitting(false);
  };

  if (loading) return <p>Loading internships...</p>;

  const pageItems = paginate(internships, page, PAGE_SIZE);

  return (
    <div>
      <div className="section-header">
        <h2>Available Internship Postings</h2>

        <span className="count-pill">
          {internships.length} internships
        </span>
      </div>

      {internships.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No internships available right now.</p>
        </div>
      ) : (
        <>
          <div className="posting-grid">
            {pageItems.map((p) => (
              <div className="posting-card" key={p.id}>
                <div className="posting-card-header">
                  <h4>{p.title}</h4>
                  <span className="status-badge approved">
                    {p.status}
                  </span>
                </div>

                <div className="posting-card-meta">
                  <span>📍 {p.location}</span>
                  <span>
                    📅 Deadline:{" "}
                    {new Date(p.deadline).toLocaleDateString()}
                  </span>
                  <span>
                    💰 ฿
                    {Number(p.paymentPerDay || 0).toLocaleString()} / day
                  </span>
                </div>

                <p>{p.description}</p>

                <div className="posting-card-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setSelected(p)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={internships.length}
            onChange={setPage}
          />
        </>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Apply for Internship</h3>

            <p className="modal-message">
              Applying for: <strong>{selected.title}</strong>
            </p>

            {message && (
              <div
                className={
                  message.includes("success")
                    ? "success-msg"
                    : "error-msg"
                }
              >
                {message}
              </div>
            )}

            <div className="form-group">
              <label>Why are you interested?</label>

              <textarea
                placeholder="Describe yourself and your interests..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Upload CV (PDF)</label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setCv(e.target.files[0])}
              />
            </div>

            <div className="form-group">
              <label>Upload Transcript (PDF)</label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setTranscript(e.target.files[0])}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={handleApply}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Applications Tab
// ─────────────────────────────────────────────────────────────

function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);

    const data = await getMyApplications();

    setApplications(Array.isArray(data) ? data : []);

    setLoading(false);
  };

  if (loading) return <p>Loading applications...</p>;

  return (
    <div>
      <div className="section-header">
        <h2>My Applications</h2>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>You have not applied to any internships yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Internship</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.internshipTitle}</td>

                <td>
                  {new Date(app.applyDate).toLocaleDateString()}
                </td>

                <td>
                  <span className={`status-badge ${app.status}`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile Tab
// ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    const data = await getMyProfile();

    setProfile(data);

    setLoading(false);
  };

  if (loading) return <p>Loading profile...</p>;

  if (!profile) {
    return (
      <div className="empty-state">
        <p>Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2>My Profile</h2>
      </div>

      <div className="form-card">
        <div className="detail-grid">
          <div>
            <strong>Full Name:</strong> {profile.name}
          </div>

          <div>
            <strong>Email:</strong> {profile.email}
          </div>

          <div>
            <strong>Student ID:</strong> {profile.studentId}
          </div>

          <div>
            <strong>Faculty:</strong> {profile.faculty}
          </div>

          <div>
            <strong>Major:</strong> {profile.major}
          </div>
        </div>
      </div>
    </div>
  );
}