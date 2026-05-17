import { useState, useEffect, useMemo } from "react";
import {
  Briefcase, FileText, User, Search, MapPin, Coins,
  ExternalLink, Trash2, CheckCircle2, AlertCircle,
  Mail, Hash, GraduationCap, Inbox, FileSearch, Sparkles,
  Clock, CalendarClock, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import {
  getApprovedInternships,
  applyForInternship,
  getMyApplications,
  getMyProfile,
  confirmApplication,
  getMyNotifications,
  markNotificationRead,
  deleteMyApplication,
} from "../services/api";

import { DashboardLayout } from "../components/layout";
import {
  Button, Card, CardBody, Input, Textarea, Modal, Table,
  StatusBadge, EmptyState, Skeleton, FileZone,
} from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination, { paginate } from "../components/Pagination";
import { avatarVariant, avatarInitial, daysUntil, isRecent } from "../utils/format";

import "../styles/pages.css";

const PAGE_SIZE = 6;
const CONFIRM_DEADLINE = new Date("2026-06-30T23:59:59");

const NAV = [
  { value: "internships", label: "Browse Internships", icon: <Briefcase size={16} /> },
  { value: "applications", label: "My Applications", icon: <FileText size={16} /> },
  { value: "profile", label: "Profile", icon: <User size={16} /> },
];

const TITLES = {
  internships: { title: "Browse Internships", subtitle: "Discover staff-approved opportunities." },
  applications: { title: "My Applications", subtitle: "Track the status of every application you've sent." },
  profile: { title: "Profile", subtitle: "Your account details and confirmed program." },
};


export default function StudentDashboard() {
  const [activeNav, setActiveNav] = useState("internships");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchNotifications = async () => {
      const data = await getMyNotifications();
      if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
  };

  const meta = TITLES[activeNav];

  return (
    <DashboardLayout
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      nav={NAV}
      activeNavItem={activeNav}
      onNavChange={setActiveNav}
      notifications={{
        items: notifications,
        onMarkRead: handleMarkRead,
        onMarkAllRead: handleMarkAllRead,
      }}
    >
      {activeNav === "internships" && <InternshipsTab />}
      {activeNav === "applications" && <ApplicationsTab />}
      {activeNav === "profile" && <ProfileTab />}
    </DashboardLayout>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Browse Internships
// ────────────────────────────────────────────────────────────────────────────

function InternshipsTab() {
  const [internships, setInternships] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [internshipData, appData] = await Promise.all([
        getApprovedInternships(),
        getMyApplications(),
      ]);
      if (!cancelled) {
        setInternships(Array.isArray(internshipData) ? internshipData : []);
        setMyApps(Array.isArray(appData) ? appData : []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return internships;
    return internships.filter((p) =>
      [p.title, p.location, p.description].some(
        (v) => v && String(v).toLowerCase().includes(q)
      )
    );
  }, [internships, search]);

  useEffect(() => { setPage(1); }, [search]);

  const pageItems = paginate(filtered, page, PAGE_SIZE);

  const activeApps = myApps.filter(
    (a) => !["withdrawn", "rejected"].includes(a.status)
  ).length;
  const acceptedApps = myApps.filter((a) => a.status === "accepted").length;
  const daysLeft = daysUntil(CONFIRM_DEADLINE);

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile stat-tile--violet">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Open positions</span>
            <span className="stat-tile__icon"><Briefcase size={20} /></span>
          </div>
          <span className="stat-tile__value">{internships.length}</span>
          <span className="stat-tile__delta">approved &amp; accepting applications</span>
        </div>

        <div className="stat-tile stat-tile--info">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Active applications</span>
            <span className="stat-tile__icon"><FileText size={20} /></span>
          </div>
          <span className="stat-tile__value">{activeApps}</span>
          <span className="stat-tile__delta">
            {acceptedApps > 0 ? `${acceptedApps} awaiting your confirmation` : "in submitted or review"}
          </span>
        </div>

        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Confirmation deadline</span>
            <span className="stat-tile__icon"><CalendarClock size={20} /></span>
          </div>
          <span className="stat-tile__value">
            {daysLeft}
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", color: "var(--color-text-muted)", marginLeft: 6 }}>
              days
            </span>
          </span>
          <span className="stat-tile__delta">until June 30, 2026</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-bar__search">
          <Input
            placeholder="Search by title, location, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={<Search size={16} />}
          />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Showing {filtered.length} of {internships.length}
        </span>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton height={20} style={{ marginBottom: 8 }} />
                <Skeleton variant="text" width="60%" style={{ marginBottom: 16 }} />
                <Skeleton variant="text" width="100%" style={{ marginBottom: 6 }} />
                <Skeleton variant="text" width="90%" style={{ marginBottom: 6 }} />
                <Skeleton variant="text" width="40%" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileSearch size={22} />}
          title={search ? "No matches" : "No internships available"}
          description={
            search
              ? "Try a different search term."
              : "Check back soon — new postings will appear here once they are approved."
          }
        />
      ) : (
        <>
          <div className="card-grid">
            {pageItems.map((p) => {
              const deadlinePassed = new Date(p.deadline) <= new Date();
              const fresh = isRecent(p.created_at || p.createdAt);
              const variant = avatarVariant(p.companyName || p.title);
              const initial = avatarInitial(p.companyName || p.title);
              return (
                <Card key={p.id} className="posting-card">
                  <CardBody>
                    <div className="posting-head">
                      <div className={`posting-avatar posting-avatar--${variant}`}>
                        {initial}
                      </div>
                      <div className="posting-title-block">
                        <h3 className="posting-title">{p.title}</h3>
                        {p.companyName && (
                          <p className="posting-company">{p.companyName}</p>
                        )}
                      </div>
                      {fresh && (
                        <span className="posting-new-tag">
                          <Sparkles size={9} />
                          New
                        </span>
                      )}
                    </div>

                    <div className="meta-chips">
                      {p.location && (
                        <span className="meta-chip">
                          <MapPin size={12} />
                          {p.location}
                        </span>
                      )}
                      {p.paymentPerDay != null && (
                        <span className="meta-chip">
                          <Coins size={12} />
                          ฿{Number(p.paymentPerDay).toLocaleString()} / day
                        </span>
                      )}
                    </div>

                    <p className="posting-description">{p.description}</p>

                    <div className="posting-foot">
                      <span className="posting-foot__deadline">
                        <Clock size={12} />
                        {deadlinePassed
                          ? "Closed"
                          : `Apply by ${new Date(p.deadline).toLocaleDateString()}`}
                      </span>
                      <Button
                        variant={deadlinePassed ? "secondary" : "primary"}
                        size="sm"
                        disabled={deadlinePassed}
                        onClick={() => setSelected(p)}
                      >
                        {deadlinePassed ? "Closed" : "Apply now"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}

      <ApplyModal
        internship={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Apply Modal
// ────────────────────────────────────────────────────────────────────────────

function ApplyModal({ internship, onClose }) {
  const [description, setDescription] = useState("");
  const [cv, setCv] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (internship) {
      setDescription("");
      setCv(null);
      setTranscript(null);
      setError("");
      setSubmitting(false);
    }
  }, [internship]);

  const handleApply = async () => {
    setError("");
    if (!description.trim()) {
      setError("Please tell the company why you're interested.");
      return;
    }
    if (!cv) {
      setError("Please upload your CV.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("cv", cv);
    if (transcript) formData.append("transcript", transcript);

    setSubmitting(true);
    const res = await applyForInternship(internship.id, formData);
    setSubmitting(false);

    if (res?.error) {
      setError(res.error);
    } else {
      toast.success("Application submitted!");
      onClose();
    }
  };

  return (
    <Modal
      open={!!internship}
      onClose={submitting ? undefined : onClose}
      title={internship ? `Apply for ${internship.title}` : ""}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply} loading={submitting}>
            Submit application
          </Button>
        </>
      }
    >
      {error && (
        <div className="notice notice--danger" style={{ marginBottom: "var(--space-4)" }}>
          <AlertCircle size={16} className="notice__icon" />
          <div className="notice__body">{error}</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Textarea
          label="Why are you interested?"
          required
          rows={4}
          placeholder="Describe your background, motivation, and what you hope to learn..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />

        <FileZone
          label="CV (PDF, required)"
          file={cv}
          onChange={setCv}
        />

        <FileZone
          label="Transcript (PDF, optional)"
          file={transcript}
          onChange={setTranscript}
        />
      </div>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Applications Tab
// ────────────────────────────────────────────────────────────────────────────

function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, app }

  const refresh = async () => {
    setLoading(true);
    const data = await getMyApplications();
    setApplications(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleConfirmInternship = async () => {
    const app = confirmAction.app;
    const res = await confirmApplication(app.id);
    if (res?.error) {
      toast.error(res.error);
      setConfirmAction(null);
      return;
    }
    toast.success("Internship confirmed!");
    setConfirmAction(null);
    setSelected(null);
    refresh();
  };

  const handleDelete = async () => {
    const app = confirmAction.app;
    const res = await deleteMyApplication(app.id);
    if (res?.error) {
      toast.error(res.error);
      setConfirmAction(null);
      return;
    }
    toast.success("Application deleted.");
    setConfirmAction(null);
    setSelected(null);
    refresh();
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={36} style={{ marginBottom: 8 }} />
          ))}
        </CardBody>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={22} />}
        title="No applications yet"
        description="Once you apply for an internship, you'll see it here with its current status."
      />
    );
  }

  const counts = applications.reduce((acc, a) => {
    acc.total += 1;
    if (a.status === "submitted" || a.status === "under-review") acc.review += 1;
    if (a.status === "accepted") acc.accepted += 1;
    if (a.status === "confirmed") acc.confirmed += 1;
    return acc;
  }, { total: 0, review: 0, accepted: 0, confirmed: 0 });

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Total submitted</span>
            <span className="stat-tile__icon"><FileText size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.total}</span>
          <span className="stat-tile__delta">across all internships</span>
        </div>
        <div className="stat-tile stat-tile--info">
          <div className="stat-tile__head">
            <span className="stat-tile__label">In review</span>
            <span className="stat-tile__icon"><Clock size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.review}</span>
          <span className="stat-tile__delta">awaiting company decision</span>
        </div>
        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Accepted</span>
            <span className="stat-tile__icon"><TrendingUp size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.accepted}</span>
          <span className="stat-tile__delta">ready for you to confirm</span>
        </div>
        <div className="stat-tile stat-tile--success">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Confirmed</span>
            <span className="stat-tile__icon"><CheckCircle2 size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.confirmed}</span>
          <span className="stat-tile__delta">{counts.confirmed > 0 ? "your secured offer" : "you can confirm one"}</span>
        </div>
      </div>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Internship</Table.HeaderCell>
            <Table.HeaderCell>Applied on</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell style={{ textAlign: "right" }}>Action</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {applications.map((app) => (
            <Table.Row
              key={app.id}
              onClick={() => setSelected(app)}
              style={{ cursor: "pointer" }}
            >
              <Table.Cell style={{ fontWeight: "var(--weight-medium)" }}>
                {app.internshipTitle}
              </Table.Cell>
              <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                {new Date(app.applyDate).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <StatusBadge status={app.status} />
              </Table.Cell>
              <Table.Cell style={{ textAlign: "right" }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(app);
                  }}
                >
                  View
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <ApplicationDetailModal
        application={selected}
        onClose={() => setSelected(null)}
        onAskConfirm={(app) => setConfirmAction({ type: "confirm", app })}
        onAskDelete={(app) => setConfirmAction({ type: "delete", app })}
      />

      <ConfirmDialog
        open={confirmAction?.type === "confirm"}
        title="Confirm this internship?"
        message="You can only confirm ONE internship across all your applications. This cannot be undone after the June 30, 2026 deadline."
        confirmLabel="Yes, confirm"
        confirmVariant="primary"
        onConfirm={handleConfirmInternship}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === "delete"}
        title="Delete this application?"
        message="The company will no longer see your application. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmAction(null)}
      />
    </section>
  );
}

function ApplicationDetailModal({ application, onClose, onAskConfirm, onAskDelete }) {
  if (!application) return null;
  const canConfirm = application.status === "accepted";
  const canDelete =
    application.status === "submitted" || application.status === "under-review";

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      title="Application details"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {canDelete && (
            <Button
              variant="danger"
              leadingIcon={<Trash2 size={14} />}
              onClick={() => onAskDelete(application)}
            >
              Delete
            </Button>
          )}
          {canConfirm && (
            <Button
              variant="primary"
              leadingIcon={<CheckCircle2 size={14} />}
              onClick={() => onAskConfirm(application)}
            >
              Confirm internship
            </Button>
          )}
        </>
      }
    >
      <div className="detail-grid" style={{ marginBottom: "var(--space-5)" }}>
        <div className="detail-item">
          <span className="detail-item__label">Internship</span>
          <span className="detail-item__value">{application.internshipTitle}</span>
        </div>
        <div className="detail-item">
          <span className="detail-item__label">Status</span>
          <span className="detail-item__value">
            <StatusBadge status={application.status} />
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-item__label">Applied on</span>
          <span className="detail-item__value">
            {new Date(application.applyDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-5)" }}>
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
            lineHeight: "var(--leading-normal)",
            whiteSpace: "pre-wrap",
          }}
        >
          {application.description || "(no description provided)"}
        </div>
      </div>

      <div>
        <span className="detail-item__label" style={{ display: "block", marginBottom: 8 }}>
          Uploaded documents
        </span>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {application.cvPath && (
            <a
              href={application.cvPath}
              target="_blank"
              rel="noreferrer"
              className="doc-link"
            >
              <ExternalLink size={14} />
              View CV
            </a>
          )}
          {application.transcriptPath && (
            <a
              href={application.transcriptPath}
              target="_blank"
              rel="noreferrer"
              className="doc-link"
            >
              <ExternalLink size={14} />
              View Transcript
            </a>
          )}
          {!application.cvPath && !application.transcriptPath && (
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              No documents attached.
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Profile Tab
// ────────────────────────────────────────────────────────────────────────────

function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getMyProfile();
      if (!cancelled) {
        setProfile(data?.error ? null : data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height={20} width="40%" style={{ marginBottom: 12 }} />
          <Skeleton variant="text" width="60%" style={{ marginBottom: 6 }} />
          <Skeleton variant="text" width="50%" />
        </CardBody>
      </Card>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Unable to load profile"
        description="Please try refreshing the page."
      />
    );
  }

  const hasInternship = Boolean(profile.internship);

  return (
    <section className="page-section">
      <Card>
        <CardBody>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-item__label">Full Name</span>
              <span className="detail-item__value">
                <User size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--color-text-muted)" }} />
                {profile.name}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Email</span>
              <span className="detail-item__value">
                <Mail size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--color-text-muted)" }} />
                {profile.email}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Student ID</span>
              <span className="detail-item__value">
                <Hash size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--color-text-muted)" }} />
                {profile.studentId}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Internship Program</span>
              <span className="detail-item__value">
                <GraduationCap size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--color-text-muted)" }} />
                {hasInternship ? profile.internship : (
                  <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--weight-regular)" }}>
                    No internship confirmed yet
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
