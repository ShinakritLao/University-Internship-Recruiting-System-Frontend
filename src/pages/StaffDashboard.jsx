import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getEmail, getFirstName } from "../services/auth";
import {
  getAllMOURequests, updateMOUStatus,
  getPendingInternships, updateInternshipStatus,
  getAllApplications,
} from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination, { paginate } from "../components/Pagination";
import "../styles/dashboard.css";

const PAGE_SIZE = 10;

export default function StaffDashboard() {
  const navigate = useNavigate();
  const email = getEmail() || "Staff";
  const firstName = getFirstName() || email;
  const [activeTab, setActiveTab] = useState("mou");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p className="dashboard-subtitle">Review MOU requests, approve internships, and monitor applications</p>
        </div>
        <div className="header-info">
          <span className="role-badge">Staff</span>
          <span className="email-info">Welcome, {firstName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "mou" ? "active" : ""}`} onClick={() => setActiveTab("mou")}>MOU Requests</button>
        <button className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`} onClick={() => setActiveTab("approvals")}>Internship Approvals</button>
        <button className={`tab-btn ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>All Applications</button>
      </div>

      <div className="tab-content">
        {activeTab === "mou"          && <MOURequestsTab />}
        {activeTab === "approvals"    && <InternshipApprovalsTab />}
        {activeTab === "applications" && <AllApplicationsTab />}
      </div>
    </div>
  );
}

// ─── MOU Requests Tab ────────────────────────────────────────────────────────

function MOURequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [page, setPage]         = useState(1);
  const [decision, setDecision] = useState(null); // { request, status }

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => { setPage(1); }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    const data = await getAllMOURequests();
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const performDecision = async (reason) => {
    if (!decision) return;
    const { request, status } = decision;
    const res = await updateMOUStatus(request.id, status, reason || "");
    if (!res.error) {
      setRequests(prev => prev.map(r =>
        r.id === request.id ? { ...r, status, rejectionReason: status === "rejected" ? reason : "" } : r
      ));
    }
    setDecision(null);
  };

  if (loading) return <p>Loading...</p>;

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const pageItems = paginate(filtered, page, PAGE_SIZE);

  return (
    <div>
      <div className="section-header">
        <h2>MOU Requests</h2>
        <div className="filter-pills">
          {["all", "pending", "approved", "rejected"].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && ` (${requests.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No MOU requests in this category.</p>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Message</th>
                <th>Document</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(r => (
                <tr key={r.id}>
                  <td className="cell-strong">{r.companyName}</td>
                  <td className="cell-message">{r.message || <span className="muted">No message</span>}</td>
                  <td>
                    {r.documentPath ? (
                      <a href={r.documentPath} target="_blank" rel="noopener noreferrer" className="link-btn">📄 View PDF</a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${r.status}`}>{r.status}</span>
                    {r.status === "rejected" && r.rejectionReason && (
                      <div className="muted" style={{ marginTop: 4, fontStyle: "normal", maxWidth: 220 }}>
                        {r.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <>
                        <button className="btn-approve" onClick={() => setDecision({ request: r, status: "approved" })}>Approve</button>
                        <button className="btn-reject"  onClick={() => setDecision({ request: r, status: "rejected" })}>Reject</button>
                      </>
                    )}
                    {r.status !== "pending" && <span className="muted">Decision made</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!decision}
        title={decision?.status === "approved" ? "Approve MOU Request?" : "Reject MOU Request?"}
        message={
          decision?.status === "approved"
            ? `Approve ${decision.request.companyName}'s MOU? It will be valid for 1 year.`
            : decision
              ? `Reject ${decision.request.companyName}'s MOU. Please provide a reason — the company will see it.`
              : ""
        }
        confirmLabel={decision?.status === "approved" ? "Approve" : "Reject"}
        confirmVariant={decision?.status === "rejected" ? "danger" : "primary"}
        requireReason={decision?.status === "rejected"}
        reasonPlaceholder="e.g. Incomplete document, missing signatures..."
        onConfirm={performDecision}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}

// ─── Internship Approvals Tab ────────────────────────────────────────────────

function InternshipApprovalsTab() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(null);
  const [page, setPage]               = useState(1);
  const [decision, setDecision]       = useState(null); // { internship, status }

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    const data = await getPendingInternships();
    setInternships(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const performDecision = async (reason) => {
    if (!decision) return;
    const { internship, status } = decision;
    const res = await updateInternshipStatus(internship.id, status, reason || "");
    if (!res.error) {
      setInternships(prev => prev.filter(i => i.id !== internship.id));
    }
    setDecision(null);
  };

  if (loading) return <p>Loading...</p>;

  const pageItems = paginate(internships, page, PAGE_SIZE);

  return (
    <div>
      <div className="section-header">
        <h2>Internship Approvals</h2>
        <span className="count-pill">{internships.length} pending</span>
      </div>

      {internships.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p>No internships pending approval.</p>
          <p className="empty-hint">All caught up!</p>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Title</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(i => (
                <Fragment key={i.id}>
                  <tr>
                    <td className="cell-strong">{i.companyName}</td>
                    <td>
                      <button className="expand-toggle" onClick={() => setExpanded(expanded === i.id ? null : i.id)}>
                        {i.title} {expanded === i.id ? "▲" : "▼"}
                      </button>
                    </td>
                    <td>{i.location}</td>
                    <td>{new Date(i.deadline).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-approve" onClick={() => setDecision({ internship: i, status: "approved" })}>Approve</button>
                      <button className="btn-reject"  onClick={() => setDecision({ internship: i, status: "rejected" })}>Reject</button>
                    </td>
                  </tr>
                  {expanded === i.id && (
                    <tr className="detail-row">
                      <td colSpan={5}>
                        <div className="detail-grid">
                          <div><strong>Duration:</strong> {i.duration}</div>
                          <div><strong>Payment per Day:</strong> ฿{Number(i.paymentPerDay || 0).toLocaleString()}</div>
                          <div><strong>Description:</strong> {i.description}</div>
                          <div><strong>Qualifications:</strong> {i.qualifications}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={internships.length} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!decision}
        title={decision?.status === "approved" ? "Approve Internship?" : "Reject Internship?"}
        message={
          decision?.status === "approved"
            ? `Approve "${decision.internship.title}" by ${decision.internship.companyName}? It will be visible to students.`
            : decision
              ? `Reject "${decision.internship.title}". Please provide a reason — the company will see it and can edit and resubmit.`
              : ""
        }
        confirmLabel={decision?.status === "approved" ? "Approve" : "Reject"}
        confirmVariant={decision?.status === "rejected" ? "danger" : "primary"}
        requireReason={decision?.status === "rejected"}
        reasonPlaceholder="e.g. Description too vague, payment below minimum..."
        onConfirm={performDecision}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}

// ─── All Applications Tab ────────────────────────────────────────────────────

function AllApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [expanded, setExpanded]         = useState(null);
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    getAllApplications().then(data => {
      setApplications(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { setPage(1); }, [filter]);

  if (loading) return <p>Loading...</p>;

  const filtered = filter === "all" ? applications : applications.filter(a => a.status === filter);
  const pageItems = paginate(filtered, page, PAGE_SIZE);

  return (
    <div>
      <div className="section-header">
        <h2>All Applications</h2>
        <div className="filter-pills">
          {["all", "submitted", "under-review", "accepted", "rejected"].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
              {f !== "all" && ` (${applications.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No applications in this category.</p>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Internship</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(app => (
                <Fragment key={app.id}>
                  <tr>
                    <td className="cell-strong">
                      <button className="expand-toggle" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                        {app.studentName} {expanded === app.id ? "▲" : "▼"}
                      </button>
                    </td>
                    <td>{app.internshipTitle}</td>
                    <td>{new Date(app.applyDate).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                  </tr>
                  {expanded === app.id && (
                    <tr className="detail-row">
                      <td colSpan={4}>
                        <div className="detail-grid">
                          <div>
                            <strong>About the applicant:</strong>{" "}
                            {app.description || <span className="muted">No description provided</span>}
                          </div>
                          <div className="detail-doc-row">
                            <strong>Documents:</strong>
                            {app.cvPath ? (
                              <a href={app.cvPath} target="_blank" rel="noopener noreferrer" className="link-btn">📄 CV</a>
                            ) : (
                              <span className="muted">No CV</span>
                            )}
                            {app.transcriptPath ? (
                              <a href={app.transcriptPath} target="_blank" rel="noopener noreferrer" className="link-btn">📄 Transcript</a>
                            ) : (
                              <span className="muted">No Transcript</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        </>
      )}
    </div>
  );
}
