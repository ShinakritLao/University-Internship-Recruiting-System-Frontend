import { useState, useEffect, useMemo, Fragment } from "react";
import {
  FileSignature, PlusSquare, Briefcase, Users,
  AlertCircle, CheckCircle2, Clock, XCircle, MapPin, Coins,
  ExternalLink, Trash2, Edit3, Send, Building2, CalendarClock,
  ChevronDown, ChevronUp, Inbox, FileText, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  createMOURequest, getMyMOU,
  createInternship, updateInternship, deleteInternship, getMyInternships,
  getApplicationsForInternship, updateApplicationStatus,
} from "../services/api";

import { DashboardLayout } from "../components/layout";
import {
  Button, Card, CardBody, Input, Select, Textarea, Modal, Table,
  StatusBadge, EmptyState, Skeleton, FileZone, Badge,
} from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination, { paginate } from "../components/Pagination";
import { avatarVariant, avatarInitial, daysUntil } from "../utils/format";

import "../styles/pages.css";

const PAGE_SIZE = 6;

const NAV = [
  { value: "mou",          label: "MOU Status",     icon: <FileSignature size={16} /> },
  { value: "post",         label: "Post Internship", icon: <PlusSquare size={16} /> },
  { value: "postings",     label: "My Postings",    icon: <Briefcase size={16} /> },
  { value: "applications", label: "Applications",   icon: <Users size={16} /> },
];

const TITLES = {
  mou:          { title: "MOU Status",      subtitle: "Submit and track your university partnership agreement." },
  post:         { title: "Post Internship", subtitle: "Create a new internship listing for staff review." },
  postings:     { title: "My Postings",     subtitle: "Manage every internship you've published." },
  applications: { title: "Applications",    subtitle: "Review applicants and update their status." },
};


export default function CompanyDashboard() {
  const [activeNav, setActiveNav] = useState("mou");
  const [selectedPostingId, setSelectedPostingId] = useState(null);

  const handleViewApplications = (id) => {
    setSelectedPostingId(id);
    setActiveNav("applications");
  };

  const meta = TITLES[activeNav];

  return (
    <DashboardLayout
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      nav={NAV}
      activeNavItem={activeNav}
      onNavChange={setActiveNav}
    >
      {activeNav === "mou"          && <MOUTab />}
      {activeNav === "post"         && <PostInternshipTab />}
      {activeNav === "postings"     && <MyPostingsTab onViewApplications={handleViewApplications} />}
      {activeNav === "applications" && <ApplicationsTab selectedPostingId={selectedPostingId} />}
    </DashboardLayout>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MOU Tab
// ────────────────────────────────────────────────────────────────────────────

function MOUTab() {
  const [mou, setMou] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const data = await getMyMOU();
    setMou(data?.error ? null : data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height={24} width="40%" style={{ marginBottom: 12 }} />
          <Skeleton variant="text" width="80%" style={{ marginBottom: 6 }} />
          <Skeleton variant="text" width="60%" />
        </CardBody>
      </Card>
    );
  }

  const canSubmit = !mou || mou.status === "rejected";

  return (
    <section className="page-section">
      {mou && <MOUStatusCard mou={mou} />}
      {canSubmit && <MOUSubmitForm hasPrior={!!mou} onSubmitted={refresh} />}
    </section>
  );
}

function MOUStatusCard({ mou }) {
  const statusConfig = {
    pending:  { tone: "warning", icon: <Clock size={20} />,         title: "Pending review",  text: "Your MOU is being reviewed by university staff. You'll be notified once a decision is made." },
    approved: { tone: "success", icon: <ShieldCheck size={20} />,   title: "MOU approved",    text: "You can now post internship listings under the Post Internship tab." },
    rejected: { tone: "danger",  icon: <XCircle size={20} />,       title: "MOU rejected",    text: "Your previous request was rejected. Please review the staff's feedback and submit a new MOU below." },
  };
  const cfg = statusConfig[mou.status] || statusConfig.pending;
  const daysToExpire = mou.status === "approved" && mou.expiresAt ? daysUntil(mou.expiresAt) : null;

  return (
    <Card style={{ marginBottom: "var(--space-6)" }}>
      <CardBody>
        <div className={`notice notice--${cfg.tone}`} style={{ marginBottom: "var(--space-5)" }}>
          <span className="notice__icon">{cfg.icon}</span>
          <div className="notice__body">
            <p className="notice__title">{cfg.title}</p>
            <p className="notice__text">{cfg.text}</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-item__label">Status</span>
            <span className="detail-item__value"><StatusBadge status={mou.status} /></span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Submitted</span>
            <span className="detail-item__value">
              {mou.createdAt ? new Date(mou.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
          {mou.status === "approved" && mou.expiresAt && (
            <div className="detail-item">
              <span className="detail-item__label">Valid until</span>
              <span className="detail-item__value">
                {new Date(mou.expiresAt).toLocaleDateString()}
                {daysToExpire != null && (
                  <span style={{ marginLeft: 8, fontSize: "var(--text-sm)", color: "var(--color-text-muted)", fontWeight: "var(--weight-regular)" }}>
                    ({daysToExpire} days)
                  </span>
                )}
              </span>
            </div>
          )}
          {mou.documentPath && (
            <div className="detail-item">
              <span className="detail-item__label">Document</span>
              <span className="detail-item__value">
                <a href={mou.documentPath} target="_blank" rel="noreferrer" className="doc-link">
                  <ExternalLink size={14} />
                  View submitted PDF
                </a>
              </span>
            </div>
          )}
        </div>

        {mou.message && (
          <div style={{ marginTop: "var(--space-5)" }}>
            <span className="detail-item__label" style={{ display: "block", marginBottom: 6 }}>
              Your message
            </span>
            <div
              style={{
                background: "var(--color-neutral-50)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3) var(--space-4)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text)",
                whiteSpace: "pre-wrap",
              }}
            >
              {mou.message}
            </div>
          </div>
        )}

        {mou.status === "rejected" && mou.rejectionReason && (
          <div className="notice notice--danger" style={{ marginTop: "var(--space-4)" }}>
            <AlertCircle size={16} className="notice__icon" />
            <div className="notice__body">
              <p className="notice__title">Feedback from staff</p>
              <p className="notice__text">{mou.rejectionReason}</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function MOUSubmitForm({ hasPrior, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!file) {
      setError("Please attach the signed MOU document (PDF).");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("message", message);
    formData.append("document", file);
    const res = await createMOURequest(formData);
    setSubmitting(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    toast.success("MOU request submitted!");
    setFile(null);
    setMessage("");
    onSubmitted?.();
  };

  return (
    <Card>
      <CardBody>
        <h3 style={{ margin: "0 0 4px", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>
          {hasPrior ? "Submit a new MOU request" : "Submit MOU request"}
        </h3>
        <p style={{ margin: "0 0 var(--space-5)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Download the MOU template, sign it, then upload the completed PDF below.
        </p>

        {error && (
          <div className="notice notice--danger" style={{ marginBottom: "var(--space-4)" }}>
            <AlertCircle size={16} className="notice__icon" />
            <div className="notice__body">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FileZone
            label="Signed MOU document"
            hint="PDF, up to 50 MB"
            required
            file={file}
            onChange={setFile}
            disabled={submitting}
          />
          <Textarea
            label="Message to university (optional)"
            placeholder="Briefly describe your company and internship intentions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            rows={4}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              leadingIcon={!submitting && <Send size={16} />}
            >
              {submitting ? "Submitting..." : "Submit MOU request"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Post Internship Tab
// ────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "", duration: "", location: "", deadline: "",
  paymentPerDay: "", description: "", qualifications: "",
};

function PostInternshipTab() {
  const [mou, setMou] = useState(null);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getMyMOU();
      setMou(data?.error ? null : data);
      setChecking(false);
    })();
  }, []);

  const mouApproved = mou?.status === "approved";
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    const required = ["title", "duration", "location", "deadline", "paymentPerDay", "description", "qualifications"];
    const missing = required.filter((k) => !String(form[k] ?? "").trim());
    if (missing.length > 0) {
      setError("All fields are required.");
      return;
    }
    const payment = parseFloat(form.paymentPerDay);
    if (Number.isNaN(payment) || payment <= 0) {
      setError("Payment per day must be a positive number.");
      return;
    }

    setSubmitting(true);
    const res = await createInternship({ ...form, paymentPerDay: payment });
    setSubmitting(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    toast.success("Internship submitted for staff approval.");
    setForm(EMPTY_FORM);
  };

  if (checking) {
    return (
      <Card>
        <CardBody>
          <Skeleton height={24} width="30%" style={{ marginBottom: 12 }} />
          <Skeleton variant="text" width="80%" />
        </CardBody>
      </Card>
    );
  }

  return (
    <section className="page-section">
      {!mouApproved && (
        <div className="notice notice--warning" style={{ marginBottom: "var(--space-5)" }}>
          <AlertCircle size={16} className="notice__icon" />
          <div className="notice__body">
            <p className="notice__title">MOU approval required</p>
            <p className="notice__text">
              Your MOU must be approved by university staff before you can post internships. Submit one in the <strong>MOU Status</strong> tab.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardBody>
          {error && (
            <div className="notice notice--danger" style={{ marginBottom: "var(--space-4)" }}>
              <AlertCircle size={16} className="notice__icon" />
              <div className="notice__body">{error}</div>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
          >
            <InternshipFormFields form={form} onChange={set} disabled={!mouApproved || submitting} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                leadingIcon={!submitting && <Send size={16} />}
                disabled={!mouApproved}
              >
                {submitting ? "Submitting..." : "Submit for approval"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
}

function InternshipFormFields({ form, onChange, disabled }) {
  return (
    <>
      <div className="form-grid form-grid--two">
        <Input
          label="Job title"
          required
          placeholder="e.g. Software Engineering Intern"
          value={form.title}
          onChange={onChange("title")}
          disabled={disabled}
        />
        <Input
          label="Duration"
          required
          placeholder="e.g. 3 months"
          value={form.duration}
          onChange={onChange("duration")}
          disabled={disabled}
        />
        <Input
          label="Location"
          required
          placeholder="e.g. Bangkok, Thailand"
          value={form.location}
          onChange={onChange("location")}
          disabled={disabled}
        />
        <Input
          label="Application deadline"
          type="date"
          required
          value={form.deadline}
          onChange={onChange("deadline")}
          disabled={disabled}
        />
        <Input
          label="Payment per day (THB)"
          type="number"
          min="0"
          step="any"
          required
          placeholder="e.g. 500"
          value={form.paymentPerDay}
          onChange={onChange("paymentPerDay")}
          disabled={disabled}
        />
      </div>
      <Textarea
        label="Description"
        required
        rows={4}
        placeholder="Describe the internship role and responsibilities..."
        value={form.description}
        onChange={onChange("description")}
        disabled={disabled}
      />
      <Textarea
        label="Required qualifications"
        required
        rows={3}
        placeholder="e.g. Basic programming knowledge, good communication skills..."
        value={form.qualifications}
        onChange={onChange("qualifications")}
        disabled={disabled}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// My Postings Tab
// ────────────────────────────────────────────────────────────────────────────

function MyPostingsTab({ onViewApplications }) {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = async () => {
    setLoading(true);
    const data = await getMyInternships();
    setPostings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteInternship(deleteTarget.id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Posting deleted.");
    }
    setDeleteTarget(null);
    refresh();
  };

  const stats = useMemo(() => {
    const out = { total: postings.length, pending: 0, approved: 0, applications: 0 };
    for (const p of postings) {
      if (p.status === "pending") out.pending += 1;
      if (p.status === "approved") out.approved += 1;
      out.applications += Number(p.applicationCount || 0);
    }
    return out;
  }, [postings]);

  const pageItems = paginate(postings, page, PAGE_SIZE);

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile stat-tile--violet">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Total postings</span>
            <span className="stat-tile__icon"><Briefcase size={20} /></span>
          </div>
          <span className="stat-tile__value">{stats.total}</span>
          <span className="stat-tile__delta">across all statuses</span>
        </div>
        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Pending review</span>
            <span className="stat-tile__icon"><Clock size={20} /></span>
          </div>
          <span className="stat-tile__value">{stats.pending}</span>
          <span className="stat-tile__delta">awaiting staff approval</span>
        </div>
        <div className="stat-tile stat-tile--success">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Live</span>
            <span className="stat-tile__icon"><CheckCircle2 size={20} /></span>
          </div>
          <span className="stat-tile__value">{stats.approved}</span>
          <span className="stat-tile__delta">visible to students</span>
        </div>
        <div className="stat-tile stat-tile--info">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Applications received</span>
            <span className="stat-tile__icon"><Users size={20} /></span>
          </div>
          <span className="stat-tile__value">{stats.applications}</span>
          <span className="stat-tile__delta">across all postings</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton height={20} style={{ marginBottom: 8 }} />
                <Skeleton variant="text" width="60%" style={{ marginBottom: 16 }} />
                <Skeleton variant="text" width="100%" style={{ marginBottom: 6 }} />
                <Skeleton variant="text" width="40%" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : postings.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={22} />}
          title="No postings yet"
          description="Head over to the Post Internship tab to publish your first listing."
        />
      ) : (
        <>
          <div className="card-grid">
            {pageItems.map((p) => (
              <PostingCard
                key={p.id}
                posting={p}
                onView={() => onViewApplications(p.id)}
                onEdit={() => setEditing(p)}
                onDelete={() => setDeleteTarget(p)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={postings.length}
            onChange={setPage}
          />
        </>
      )}

      {editing && (
        <EditPostingModal
          posting={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this posting?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" and all its applications will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

function PostingCard({ posting, onView, onEdit, onDelete }) {
  const variant = avatarVariant(posting.title);
  const initial = avatarInitial(posting.title);
  const apps = Number(posting.applicationCount || 0);
  const isApproved = posting.status === "approved";

  return (
    <Card className="posting-card">
      <CardBody>
        <div className="posting-head">
          <div className={`posting-avatar posting-avatar--${variant}`}>{initial}</div>
          <div className="posting-title-block">
            <h3 className="posting-title">{posting.title}</h3>
            <p className="posting-company">
              {apps} {apps === 1 ? "application" : "applications"}
            </p>
          </div>
          <StatusBadge status={posting.status} />
        </div>

        <div className="meta-chips">
          {posting.location && (
            <span className="meta-chip">
              <MapPin size={12} />
              {posting.location}
            </span>
          )}
          {posting.deadline && (
            <span className="meta-chip">
              <CalendarClock size={12} />
              {new Date(posting.deadline).toLocaleDateString()}
            </span>
          )}
          {posting.paymentPerDay != null && (
            <span className="meta-chip">
              <Coins size={12} />
              ฿{Number(posting.paymentPerDay).toLocaleString()}/day
            </span>
          )}
        </div>

        {posting.status === "rejected" && posting.rejectionReason && (
          <div className="notice notice--danger" style={{ marginBottom: "var(--space-3)", padding: "var(--space-3)" }}>
            <AlertCircle size={14} className="notice__icon" />
            <div className="notice__body">
              <p className="notice__title">Rejected by staff</p>
              <p className="notice__text">{posting.rejectionReason}</p>
            </div>
          </div>
        )}

        <p className="posting-description">{posting.description}</p>

        <div className="posting-foot">
          <Button variant="secondary" size="sm" onClick={onView} leadingIcon={<Users size={14} />}>
            View applicants{apps > 0 ? ` (${apps})` : ""}
          </Button>
          <div style={{ display: "flex", gap: "var(--space-1)" }}>
            {!isApproved && (
              <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit">
                <Edit3 size={14} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function EditPostingModal({ posting, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: posting.title || "",
    description: posting.description || "",
    duration: posting.duration || "",
    location: posting.location || "",
    deadline: posting.deadline ? String(posting.deadline).slice(0, 10) : "",
    qualifications: posting.qualifications || "",
    paymentPerDay: posting.paymentPerDay ?? "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError("");
    const required = ["title", "duration", "location", "deadline", "paymentPerDay", "description", "qualifications"];
    const missing = required.filter((k) => !String(form[k] ?? "").trim());
    if (missing.length > 0) {
      setError("All fields are required.");
      return;
    }
    const payment = parseFloat(form.paymentPerDay);
    if (Number.isNaN(payment) || payment <= 0) {
      setError("Payment per day must be a positive number.");
      return;
    }

    setBusy(true);
    const res = await updateInternship(posting.id, { ...form, paymentPerDay: payment });
    setBusy(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    toast.success("Posting updated. It will be re-reviewed by staff.");
    onSaved();
  };

  return (
    <Modal
      open
      onClose={busy ? undefined : onClose}
      title="Edit posting"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={busy}>Save changes</Button>
        </>
      }
    >
      <div className="notice notice--info" style={{ marginBottom: "var(--space-4)" }}>
        <AlertCircle size={16} className="notice__icon" />
        <div className="notice__body">
          Editing resets the posting status to <strong>pending</strong> and triggers re-approval.
        </div>
      </div>

      {error && (
        <div className="notice notice--danger" style={{ marginBottom: "var(--space-4)" }}>
          <AlertCircle size={16} className="notice__icon" />
          <div className="notice__body">{error}</div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <InternshipFormFields form={form} onChange={set} disabled={busy} />
      </form>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Applications Tab
// ────────────────────────────────────────────────────────────────────────────

function ApplicationsTab({ selectedPostingId }) {
  const [postings, setPostings] = useState([]);
  const [internshipId, setInternshipId] = useState(selectedPostingId || "");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getMyInternships();
      setPostings(Array.isArray(data) ? data : []);
    })();
  }, []);

  useEffect(() => {
    if (!internshipId) {
      setApplications([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setPage(1);
      const data = await getApplicationsForInternship(internshipId);
      if (cancelled) return;
      if (data?.error) {
        setError(data.error);
        setApplications([]);
      } else {
        setApplications(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [internshipId]);

  const performStatusChange = async () => {
    if (!confirm) return;
    const { app, status } = confirm;
    const res = await updateApplicationStatus(app.id, status);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Applicant ${status === "rejected" ? "rejected" : "updated"}.`);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    }
    setConfirm(null);
  };

  const counts = useMemo(() => {
    const out = { total: applications.length, awaiting: 0, accepted: 0, rejected: 0 };
    for (const a of applications) {
      if (a.status === "submitted" || a.status === "under-review") out.awaiting += 1;
      if (a.status === "accepted" || a.status === "confirmed") out.accepted += 1;
      if (a.status === "rejected") out.rejected += 1;
    }
    return out;
  }, [applications]);

  const statusLabels = {
    "under-review": "Mark as Under Review",
    accepted: "Accept Application",
    rejected: "Reject Application",
  };

  const pageItems = paginate(applications, page, PAGE_SIZE);
  const selectedPosting = postings.find((p) => String(p.id) === String(internshipId));

  return (
    <section className="page-section">
      <Card style={{ marginBottom: "var(--space-5)" }}>
        <CardBody>
          <Select
            label="Select internship posting"
            placeholder="-- Choose a posting --"
            value={internshipId}
            onChange={(e) => setInternshipId(e.target.value)}
            options={postings.map((p) => ({ value: p.id, label: p.title }))}
          />
        </CardBody>
      </Card>

      {!internshipId ? (
        <EmptyState
          icon={<Users size={22} />}
          title="Pick a posting"
          description="Choose one of your internships above to view its applicants."
        />
      ) : (
        <>
          {selectedPosting && (
            <div className="stat-grid">
              <div className="stat-tile stat-tile--info">
                <div className="stat-tile__head">
                  <span className="stat-tile__label">Total applicants</span>
                  <span className="stat-tile__icon"><Users size={20} /></span>
                </div>
                <span className="stat-tile__value">{counts.total}</span>
                <span className="stat-tile__delta">received for this posting</span>
              </div>
              <div className="stat-tile stat-tile--warning">
                <div className="stat-tile__head">
                  <span className="stat-tile__label">Awaiting decision</span>
                  <span className="stat-tile__icon"><Clock size={20} /></span>
                </div>
                <span className="stat-tile__value">{counts.awaiting}</span>
                <span className="stat-tile__delta">submitted or under review</span>
              </div>
              <div className="stat-tile stat-tile--success">
                <div className="stat-tile__head">
                  <span className="stat-tile__label">Accepted</span>
                  <span className="stat-tile__icon"><CheckCircle2 size={20} /></span>
                </div>
                <span className="stat-tile__value">{counts.accepted}</span>
                <span className="stat-tile__delta">offers extended</span>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__head">
                  <span className="stat-tile__label">Rejected</span>
                  <span className="stat-tile__icon"><XCircle size={20} /></span>
                </div>
                <span className="stat-tile__value">{counts.rejected}</span>
                <span className="stat-tile__delta">not moving forward</span>
              </div>
            </div>
          )}

          {error && (
            <div className="notice notice--danger" style={{ marginBottom: "var(--space-4)" }}>
              <AlertCircle size={16} className="notice__icon" />
              <div className="notice__body">{error}</div>
            </div>
          )}

          {loading ? (
            <Card>
              <CardBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={36} style={{ marginBottom: 8 }} />
                ))}
              </CardBody>
            </Card>
          ) : applications.length === 0 ? (
            <EmptyState
              icon={<Inbox size={22} />}
              title="No applications yet"
              description="When students apply for this posting, they'll show up here."
            />
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Student</Table.HeaderCell>
                    <Table.HeaderCell>Applied on</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell style={{ textAlign: "right" }}>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {pageItems.map((app) => {
                    const isOpen = expanded === app.id;
                    return (
                      <Fragment key={app.id}>
                        <Table.Row>
                          <Table.Cell>
                            <button
                              type="button"
                              onClick={() => setExpanded(isOpen ? null : app.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                color: "var(--color-text)",
                                fontWeight: "var(--weight-medium)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {app.studentName}
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </Table.Cell>
                          <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                            {new Date(app.applyDate).toLocaleDateString()}
                          </Table.Cell>
                          <Table.Cell>
                            <StatusBadge status={app.status} />
                          </Table.Cell>
                          <Table.Cell style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              {app.status === "submitted" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setConfirm({ app, status: "under-review" })}
                                >
                                  Under review
                                </Button>
                              )}
                              {(app.status === "submitted" || app.status === "under-review") && (
                                <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setConfirm({ app, status: "accepted" })}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setConfirm({ app, status: "rejected" })}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {(app.status === "accepted" || app.status === "rejected" || app.status === "confirmed" || app.status === "withdrawn") && (
                                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                                  Decision made
                                </span>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                        {isOpen && (
                          <Table.Row>
                            <Table.Cell
                              colSpan={4}
                              style={{
                                background: "var(--color-neutral-25)",
                                padding: "var(--space-4)",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                                <div>
                                  <span className="detail-item__label" style={{ display: "block", marginBottom: 4 }}>
                                    About the applicant
                                  </span>
                                  <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text)", whiteSpace: "pre-wrap" }}>
                                    {app.description || (
                                      <span style={{ color: "var(--color-text-muted)" }}>No description provided.</span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="detail-item__label" style={{ display: "block", marginBottom: 6 }}>
                                    Documents
                                  </span>
                                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                                    {app.cvPath ? (
                                      <a href={app.cvPath} target="_blank" rel="noreferrer" className="doc-link">
                                        <ExternalLink size={14} />
                                        View CV
                                      </a>
                                    ) : (
                                      <Badge tone="neutral">No CV</Badge>
                                    )}
                                    {app.transcriptPath ? (
                                      <a href={app.transcriptPath} target="_blank" rel="noreferrer" className="doc-link">
                                        <ExternalLink size={14} />
                                        View Transcript
                                      </a>
                                    ) : (
                                      <Badge tone="neutral">No Transcript</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Fragment>
                    );
                  })}
                </Table.Body>
              </Table>

              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={applications.length}
                onChange={setPage}
              />
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm ? statusLabels[confirm.status] : ""}
        message={
          confirm
            ? `Set ${confirm.app.studentName}'s application to "${confirm.status}"?`
            : ""
        }
        confirmLabel={confirm ? statusLabels[confirm.status]?.split(" ")[0] : "Confirm"}
        confirmVariant={confirm?.status === "rejected" ? "danger" : "primary"}
        onConfirm={performStatusChange}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
