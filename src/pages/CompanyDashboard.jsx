import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getEmail, getFirstName } from "../services/auth";
import {
  createMOURequest, getMyMOU,
  createInternship, updateInternship, deleteInternship, getMyInternships,
  getApplicationsForInternship, updateApplicationStatus,
} from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination, { paginate } from "../components/Pagination";
import "../styles/dashboard.css";

const PAGE_SIZE = 5;

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const email = getEmail() || "Company";
  const firstName = getFirstName() || email;

  const [activeTab, setActiveTab] = useState("mou");
  const [selectedPostingId, setSelectedPostingId] = useState(null);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleViewApplications = (internshipId) => {
    setSelectedPostingId(internshipId);
    setActiveTab("applications");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Company Dashboard</h1>
          <p className="dashboard-subtitle">Manage your MOU, internship postings, and applications</p>
        </div>
        <div className="header-info">
          <span className="role-badge">Company</span>
          <span className="email-info">Welcome, {firstName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "mou" ? "active" : ""}`} onClick={() => setActiveTab("mou")}>MOU Request</button>
        <button className={`tab-btn ${activeTab === "post" ? "active" : ""}`} onClick={() => setActiveTab("post")}>Post Internship</button>
        <button className={`tab-btn ${activeTab === "postings" ? "active" : ""}`} onClick={() => setActiveTab("postings")}>My Postings</button>
        <button className={`tab-btn ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>Applications</button>
      </div>

      <div className="tab-content">
        {activeTab === "mou"          && <MOUTab />}
        {activeTab === "post"         && <PostInternshipTab />}
        {activeTab === "postings"     && <MyPostingsTab onViewApplications={handleViewApplications} />}
        {activeTab === "applications" && <ApplicationsTab selectedPostingId={selectedPostingId} />}
      </div>
    </div>
  );
}

// ─── MOU Tab ────────────────────────────────────────────────────────────────

function MOUTab() {
  const [mou, setMou] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMOU();
  }, []);

  const fetchMOU = async () => {
    setLoading(true);
    const data = await getMyMOU();
    setMou(data.error ? null : data);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!file) {
      setError("Please attach the signed MOU document (PDF).");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("message", message);
    formData.append("document", file);
    const res = await createMOURequest(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("MOU request submitted successfully!");
      setMessage("");
      setFile(null);
      fetchMOU();
    }
    setSubmitting(false);
  };

  if (loading) return <p>Loading...</p>;

  const statusIcon = { pending: "⏳", approved: "✓", rejected: "✕" };

  return (
    <div>
      <div className="section-header">
        <h2>MOU Request</h2>
      </div>

      {mou && (
        <div className={`mou-status-card ${mou.status}`}>
          <div className="mou-status-icon">{statusIcon[mou.status]}</div>
          <div className="mou-status-body">
            <h3>
              {mou.status === "pending"  && "MOU Request Pending Review"}
              {mou.status === "approved" && "MOU Approved"}
              {mou.status === "rejected" && "MOU Request Rejected"}
            </h3>
            <p>
              {mou.status === "pending"  && "Your MOU request is being reviewed by university staff. You will be notified once a decision is made."}
              {mou.status === "approved" && "You can now post internship listings under the Post Internship tab."}
              {mou.status === "rejected" && "Your previous request was rejected. You may submit a new MOU below."}
            </p>
            {mou.status === "rejected" && mou.rejectionReason && (
              <div className="mou-message"><strong>Reason from staff:</strong> {mou.rejectionReason}</div>
            )}
            {mou.message && <p className="mou-message"><strong>Your message:</strong> {mou.message}</p>}
            <div className="mou-meta">
              <span>Submitted: {new Date(mou.createdAt).toLocaleDateString()}</span>
              {mou.status === "approved" && mou.expiresAt && (
                <span>Expires: {new Date(mou.expiresAt).toLocaleDateString()}</span>
              )}
              {mou.documentPath && (
                <a href={mou.documentPath} target="_blank" rel="noopener noreferrer" className="link-btn">
                  📄 View submitted document
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {(!mou || mou.status === "rejected") && (
        <div className="form-card">
          <h3>{mou ? "Submit New MOU Request" : "Submit MOU Request"}</h3>
          <p className="form-hint">
            Download the MOU template, fill and sign it, then upload the completed PDF below.
          </p>
          {error   && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <div className="form-group">
            <label>Signed MOU Document (PDF) <span className="required">*</span></label>
            <div className="file-upload-area">
              <input
                type="file"
                accept="application/pdf"
                id="mou-file"
                onChange={handleFileChange}
                disabled={submitting}
                style={{ display: "none" }}
              />
              <label htmlFor="mou-file" className="file-upload-label">
                {file ? (
                  <>
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  </>
                ) : (
                  <>
                    <span className="file-icon">⬆</span>
                    <span>Click to upload PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Message to University (optional)</label>
            <textarea
              placeholder="Briefly describe your company and internship intentions..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit MOU Request"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Internship Tab ─────────────────────────────────────────────────────

function PostInternshipTab() {
  const [mouApproved, setMouApproved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", duration: "", location: "", deadline: "", qualifications: "", paymentPerDay: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyMOU().then(data => {
      setMouApproved(!data.error && data.status === "approved");
      setChecking(false);
    });
  }, []);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    const { title, description, duration, location, deadline, qualifications, paymentPerDay } = form;
    if (!title || !description || !duration || !location || !deadline || !qualifications || !paymentPerDay) {
      setError("All fields are required.");
      return;
    }
    const payment = parseFloat(paymentPerDay);
    if (isNaN(payment) || payment <= 0) {
      setError("Payment per day must be a positive number.");
      return;
    }
    setSubmitting(true);
    const res = await createInternship({ ...form, paymentPerDay: payment });
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Internship submitted for approval!");
      setForm({ title: "", description: "", duration: "", location: "", deadline: "", qualifications: "", paymentPerDay: "" });
    }
    setSubmitting(false);
  };

  if (checking) return <p>Loading...</p>;

  return (
    <div>
      <div className="section-header">
        <h2>Post Internship</h2>
      </div>

      {!mouApproved && (
        <div className="warning-box">
          <strong>⚠ MOU approval required.</strong> Your MOU must be approved by university staff before you can post internships.
          Please submit an MOU request in the <strong>MOU Request</strong> tab first.
        </div>
      )}

      <div className="form-card">
        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Job Title <span className="required">*</span></label>
            <input type="text" placeholder="e.g. Software Engineering Intern" value={form.title} onChange={handleChange("title")} disabled={!mouApproved || submitting} />
          </div>
          <div className="form-group">
            <label>Duration <span className="required">*</span></label>
            <input type="text" placeholder="e.g. 3 months" value={form.duration} onChange={handleChange("duration")} disabled={!mouApproved || submitting} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <input type="text" placeholder="e.g. Bangkok, Thailand" value={form.location} onChange={handleChange("location")} disabled={!mouApproved || submitting} />
          </div>
          <div className="form-group">
            <label>Application Deadline <span className="required">*</span></label>
            <input type="date" value={form.deadline} onChange={handleChange("deadline")} disabled={!mouApproved || submitting} />
          </div>
        </div>

        <div className="form-group">
          <label>Payment per Day (THB) <span className="required">*</span></label>
          <input type="number" min="0" step="any" placeholder="e.g. 500" value={form.paymentPerDay} onChange={handleChange("paymentPerDay")} disabled={!mouApproved || submitting} />
        </div>

        <div className="form-group">
          <label>Description <span className="required">*</span></label>
          <textarea placeholder="Describe the internship role and responsibilities..." value={form.description} onChange={handleChange("description")} disabled={!mouApproved || submitting} />
        </div>

        <div className="form-group">
          <label>Required Qualifications <span className="required">*</span></label>
          <textarea placeholder="e.g. Basic programming knowledge, good communication skills..." value={form.qualifications} onChange={handleChange("qualifications")} disabled={!mouApproved || submitting} />
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={!mouApproved || submitting}>
          {submitting ? "Submitting..." : "Submit for Approval"}
        </button>
      </div>
    </div>
  );
}

// ─── My Postings Tab ─────────────────────────────────────────────────────────

function MyPostingsTab({ onViewApplications }) {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [editing, setEditing]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy]         = useState(false);

  useEffect(() => { fetchPostings(); }, []);

  const fetchPostings = async () => {
    setLoading(true);
    const data = await getMyInternships();
    setPostings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    await deleteInternship(deleteTarget.id);
    setDeleteTarget(null);
    setBusy(false);
    fetchPostings();
  };

  if (loading) return <p>Loading...</p>;

  const pageItems = paginate(postings, page, PAGE_SIZE);

  return (
    <div>
      <div className="section-header">
        <h2>My Postings</h2>
        <span className="count-pill">{postings.length} {postings.length === 1 ? "posting" : "postings"}</span>
      </div>
      {postings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No internship postings yet.</p>
          <p className="empty-hint">Head over to the Post Internship tab to create your first one.</p>
        </div>
      ) : (
        <>
          <div className="posting-grid">
            {pageItems.map(p => (
              <div className="posting-card" key={p.id}>
                <div className="posting-card-header">
                  <h4>
                    {p.title}
                    {p.applicationCount > 0 && (
                      <span className="app-count-badge">{p.applicationCount} app{p.applicationCount === 1 ? "" : "s"}</span>
                    )}
                  </h4>
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </div>
                <div className="posting-card-meta">
                  <span>📍 {p.location}</span>
                  <span>📅 Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                  <span>💰 ฿{Number(p.paymentPerDay || 0).toLocaleString()} / day</span>
                </div>
                {p.status === "rejected" && p.rejectionReason && (
                  <div className="posting-rejection">
                    <strong>Rejected:</strong> {p.rejectionReason}
                  </div>
                )}
                <div className="posting-card-actions">
                  <button className="btn-secondary" onClick={() => onViewApplications(p.id)}>
                    View Applications
                  </button>
                  {p.status !== "approved" && (
                    <button className="icon-btn" onClick={() => setEditing(p)}>✎ Edit</button>
                  )}
                  <button className="icon-btn danger" onClick={() => setDeleteTarget(p)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={postings.length} onChange={setPage} />
        </>
      )}

      {editing && (
        <EditPostingModal
          posting={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchPostings(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this posting?"
        message={deleteTarget ? `"${deleteTarget.title}" and all its applications will be permanently removed. This cannot be undone.` : ""}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => !busy && setDeleteTarget(null)}
      />
    </div>
  );
}

function EditPostingModal({ posting, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: posting.title || "",
    description: posting.description || "",
    duration: posting.duration || "",
    location: posting.location || "",
    deadline: posting.deadline ? posting.deadline.slice(0, 10) : "",
    qualifications: posting.qualifications || "",
    paymentPerDay: posting.paymentPerDay || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError("");
    const { title, description, duration, location, deadline, qualifications, paymentPerDay } = form;
    if (!title || !description || !duration || !location || !deadline || !qualifications || !paymentPerDay) {
      setError("All fields are required.");
      return;
    }
    const payment = parseFloat(paymentPerDay);
    if (isNaN(payment) || payment <= 0) {
      setError("Payment per day must be a positive number.");
      return;
    }
    setBusy(true);
    const res = await updateInternship(posting.id, { ...form, paymentPerDay: payment });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onSaved();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <h3>Edit Posting</h3>
        <p className="modal-message">
          Editing this posting will reset its status to <strong>pending</strong> and require staff re-approval.
        </p>
        {error && <div className="error-msg">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Job Title</label>
            <input type="text" value={form.title} onChange={handleChange("title")} disabled={busy} />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input type="text" value={form.duration} onChange={handleChange("duration")} disabled={busy} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input type="text" value={form.location} onChange={handleChange("location")} disabled={busy} />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input type="date" value={form.deadline} onChange={handleChange("deadline")} disabled={busy} />
          </div>
        </div>
        <div className="form-group">
          <label>Payment per Day (THB)</label>
          <input type="number" min="0" step="any" value={form.paymentPerDay} onChange={handleChange("paymentPerDay")} disabled={busy} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={handleChange("description")} disabled={busy} />
        </div>
        <div className="form-group">
          <label>Qualifications</label>
          <textarea value={form.qualifications} onChange={handleChange("qualifications")} disabled={busy} />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function ApplicationsTab({ selectedPostingId }) {
  const [postings, setPostings]         = useState([]);
  const [internshipId, setInternshipId] = useState(selectedPostingId || "");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [expanded, setExpanded]         = useState(null);
  const [page, setPage]                 = useState(1);
  const [confirm, setConfirm]           = useState(null); // { app, status }

  useEffect(() => {
    getMyInternships().then(data => setPostings(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (internshipId) {
      setPage(1);
      fetchApplications(internshipId);
    }
  }, [internshipId]);

  const fetchApplications = async (id) => {
    setLoading(true);
    setError("");
    const data = await getApplicationsForInternship(id);
    if (data.error) {
      setError(data.error);
      setApplications([]);
    } else {
      setApplications(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const performStatusChange = async () => {
    if (!confirm) return;
    const { app, status } = confirm;
    const res = await updateApplicationStatus(app.id, status);
    if (!res.error) {
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
    }
    setConfirm(null);
  };

  const pageItems = paginate(applications, page, PAGE_SIZE);

  const statusLabels = {
    "under-review": "Mark as Under Review",
    accepted: "Accept Application",
    rejected: "Reject Application",
  };

  return (
    <div>
      <div className="section-header">
        <h2>Applications</h2>
      </div>

      <div className="form-group">
        <label>Select Internship Posting</label>
        <select value={internshipId} onChange={e => setInternshipId(e.target.value)}>
          <option value="">-- Choose a posting --</option>
          {postings.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading && <p>Loading applications...</p>}

      {!loading && internshipId && applications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No applications for this posting yet.</p>
        </div>
      )}

      {applications.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(app => (
                <Fragment key={app.id}>
                  <tr>
                    <td>
                      <button
                        className="expand-toggle"
                        onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      >
                        {app.studentName} {expanded === app.id ? "▲" : "▼"}
                      </button>
                    </td>
                    <td>{new Date(app.applyDate).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                    <td>
                      {app.status === "submitted" && (
                        <button className="btn-approve" onClick={() => setConfirm({ app, status: "under-review" })}>
                          Under Review
                        </button>
                      )}
                      {(app.status === "submitted" || app.status === "under-review") && (
                        <>
                          <button className="btn-approve" onClick={() => setConfirm({ app, status: "accepted" })}>
                            Accept
                          </button>
                          <button className="btn-reject" onClick={() => setConfirm({ app, status: "rejected" })}>
                            Reject
                          </button>
                        </>
                      )}
                      {(app.status === "accepted" || app.status === "rejected") && (
                        <span className="muted">Decision made</span>
                      )}
                    </td>
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={applications.length} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm ? statusLabels[confirm.status] : ""}
        message={confirm ? `Are you sure you want to set ${confirm.app.studentName}'s application to "${confirm.status}"?` : ""}
        confirmLabel={confirm ? statusLabels[confirm.status]?.split(" ")[0] : "Confirm"}
        confirmVariant={confirm?.status === "rejected" ? "danger" : "primary"}
        onConfirm={performStatusChange}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
