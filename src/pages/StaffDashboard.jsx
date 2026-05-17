import { useState, useEffect, useMemo, Fragment } from "react";
import {
  FileSignature, ClipboardCheck, Database,
  AlertCircle, CheckCircle2, Clock, XCircle, MapPin, Coins,
  ExternalLink, Building2, Users, Inbox, ChevronDown, ChevronUp,
  ShieldCheck, CalendarClock, Hash,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAllMOURequests, updateMOUStatus,
  getPendingInternships, updateInternshipStatus,
  getAllApplications,
} from "../services/api";

import { DashboardLayout } from "../components/layout";
import {
  Button, Card, CardBody, Table, StatusBadge, EmptyState, Skeleton, Badge,
} from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination, { paginate } from "../components/Pagination";
import { avatarVariant, avatarInitial } from "../utils/format";

import "../styles/pages.css";

const PAGE_SIZE = 10;

const NAV = [
  { value: "mou",          label: "MOU Requests",         icon: <FileSignature size={16} /> },
  { value: "approvals",    label: "Internship Approvals", icon: <ClipboardCheck size={16} /> },
  { value: "applications", label: "All Applications",     icon: <Database size={16} /> },
];

const TITLES = {
  mou:          { title: "MOU Requests",          subtitle: "Review and approve company partnership agreements." },
  approvals:    { title: "Internship Approvals",  subtitle: "Approve internship postings before they go live to students." },
  applications: { title: "All Applications",      subtitle: "Read-only oversight across every application in the system." },
};

function FilterChips({ value, onChange, options }) {
  return (
    <div className="filter-chips">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`filter-chip ${isActive ? "filter-chip--active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
            {opt.count != null && (
              <span className="filter-chip__count">{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CompanyCell({ name }) {
  const variant = avatarVariant(name);
  const initial = avatarInitial(name);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        className={`posting-avatar posting-avatar--${variant}`}
        style={{ width: 32, height: 32, fontSize: "var(--text-sm)" }}
      >
        {initial}
      </span>
      <span style={{ fontWeight: "var(--weight-medium)", color: "var(--color-text)" }}>
        {name}
      </span>
    </div>
  );
}

export default function StaffDashboard() {
  const [activeNav, setActiveNav] = useState("mou");
  const meta = TITLES[activeNav];

  return (
    <DashboardLayout
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      nav={NAV}
      activeNavItem={activeNav}
      onNavChange={setActiveNav}
    >
      {activeNav === "mou"          && <MOURequestsTab />}
      {activeNav === "approvals"    && <InternshipApprovalsTab />}
      {activeNav === "applications" && <AllApplicationsTab />}
    </DashboardLayout>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MOU Requests
// ────────────────────────────────────────────────────────────────────────────

function MOURequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState(null);

  const refresh = async () => {
    setLoading(true);
    const data = await getAllMOURequests();
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setPage(1); }, [filter]);

  const performDecision = async (reason) => {
    if (!decision) return;
    const { request, status } = decision;
    const res = await updateMOUStatus(request.id, status, reason || "");
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(status === "approved" ? "MOU approved." : "MOU rejected.");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status, rejectionReason: status === "rejected" ? reason : "" }
            : r
        )
      );
    }
    setDecision(null);
  };

  const counts = useMemo(
    () =>
      requests.reduce(
        (acc, r) => {
          acc.total += 1;
          if (r.status === "pending") acc.pending += 1;
          if (r.status === "approved") acc.approved += 1;
          if (r.status === "rejected") acc.rejected += 1;
          return acc;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      ),
    [requests]
  );

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pageItems = paginate(filtered, page, PAGE_SIZE);

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Pending review</span>
            <span className="stat-tile__icon"><Clock size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.pending}</span>
          <span className="stat-tile__delta">awaiting your decision</span>
        </div>
        <div className="stat-tile stat-tile--success">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Approved</span>
            <span className="stat-tile__icon"><ShieldCheck size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.approved}</span>
          <span className="stat-tile__delta">active partnerships</span>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Rejected</span>
            <span className="stat-tile__icon"><XCircle size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.rejected}</span>
          <span className="stat-tile__delta">companies notified</span>
        </div>
        <div className="stat-tile stat-tile--violet">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Total requests</span>
            <span className="stat-tile__icon"><FileSignature size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.total}</span>
          <span className="stat-tile__delta">all-time</span>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.total },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
          ]}
        />
      </div>

      {loading ? (
        <Card>
          <CardBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={42} style={{ marginBottom: 8 }} />
            ))}
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={22} />}
          title="No MOU requests"
          description={
            filter === "all"
              ? "When companies submit MOU requests, they'll appear here."
              : `No requests in the "${filter}" status.`
          }
        />
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Company</Table.HeaderCell>
                <Table.HeaderCell>Message</Table.HeaderCell>
                <Table.HeaderCell>Document</Table.HeaderCell>
                <Table.HeaderCell>Submitted</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell style={{ textAlign: "right" }}>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {pageItems.map((r) => (
                <Table.Row key={r.id}>
                  <Table.Cell>
                    <CompanyCell name={r.companyName} />
                  </Table.Cell>
                  <Table.Cell
                    style={{
                      maxWidth: 280,
                      color: "var(--color-text-muted)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {r.message ? (
                      <span style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {r.message}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-subtle)" }}>No message</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {r.documentPath ? (
                      <a
                        href={r.documentPath}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        <ExternalLink size={14} />
                        View PDF
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-subtle)" }}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <StatusBadge status={r.status} />
                      {r.status === "rejected" && r.rejectionReason && (
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-muted)",
                            maxWidth: 220,
                          }}
                        >
                          {r.rejectionReason}
                        </span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell style={{ textAlign: "right" }}>
                    {r.status === "pending" ? (
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setDecision({ request: r, status: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDecision({ request: r, status: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                        Decision made
                      </span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!decision}
        title={decision?.status === "approved" ? "Approve MOU request?" : "Reject MOU request?"}
        message={
          decision?.status === "approved"
            ? `Approve ${decision.request.companyName}'s MOU? It will be valid for 1 year and the company can post internships.`
            : decision
              ? `Reject ${decision.request.companyName}'s MOU. Provide a reason — the company will see it.`
              : ""
        }
        confirmLabel={decision?.status === "approved" ? "Approve" : "Reject"}
        confirmVariant={decision?.status === "rejected" ? "danger" : "primary"}
        requireReason={decision?.status === "rejected"}
        reasonPlaceholder="e.g. Incomplete document, missing signatures..."
        onConfirm={performDecision}
        onCancel={() => setDecision(null)}
      />
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Internship Approvals
// ────────────────────────────────────────────────────────────────────────────

function InternshipApprovalsTab() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState(null);

  const refresh = async () => {
    setLoading(true);
    const data = await getPendingInternships();
    setInternships(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const performDecision = async (reason) => {
    if (!decision) return;
    const { internship, status } = decision;
    const res = await updateInternshipStatus(internship.id, status, reason || "");
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(status === "approved" ? "Internship approved & live." : "Internship rejected.");
      setInternships((prev) => prev.filter((i) => i.id !== internship.id));
    }
    setDecision(null);
  };

  const pageItems = paginate(internships, page, PAGE_SIZE);
  const pending = internships.length;

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Pending review</span>
            <span className="stat-tile__icon"><Clock size={20} /></span>
          </div>
          <span className="stat-tile__value">{pending}</span>
          <span className="stat-tile__delta">
            {pending === 0 ? "all caught up" : "waiting for your decision"}
          </span>
        </div>
        <div className="stat-tile stat-tile--info">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Companies queued</span>
            <span className="stat-tile__icon"><Building2 size={20} /></span>
          </div>
          <span className="stat-tile__value">
            {new Set(internships.map((i) => i.companyName)).size}
          </span>
          <span className="stat-tile__delta">unique companies in the queue</span>
        </div>
        <div className="stat-tile stat-tile--violet">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Earliest deadline</span>
            <span className="stat-tile__icon"><CalendarClock size={20} /></span>
          </div>
          <span className="stat-tile__value" style={{ fontSize: "var(--text-xl)" }}>
            {(() => {
              const dates = internships
                .map((i) => i.deadline)
                .filter(Boolean)
                .map((d) => new Date(d))
                .filter((d) => !Number.isNaN(d.getTime()));
              if (dates.length === 0) return "—";
              const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
              return earliest.toLocaleDateString();
            })()}
          </span>
          <span className="stat-tile__delta">across pending postings</span>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={42} style={{ marginBottom: 8 }} />
            ))}
          </CardBody>
        </Card>
      ) : internships.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={22} />}
          title="All caught up"
          description="No internships are currently pending approval."
        />
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Company</Table.HeaderCell>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Location</Table.HeaderCell>
                <Table.HeaderCell>Deadline</Table.HeaderCell>
                <Table.HeaderCell style={{ textAlign: "right" }}>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {pageItems.map((i) => {
                const isOpen = expanded === i.id;
                return (
                  <Fragment key={i.id}>
                    <Table.Row>
                      <Table.Cell>
                        <CompanyCell name={i.companyName} />
                      </Table.Cell>
                      <Table.Cell>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : i.id)}
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
                          {i.title}
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </Table.Cell>
                      <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} />
                          {i.location}
                        </span>
                      </Table.Cell>
                      <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                        {new Date(i.deadline).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setDecision({ internship: i, status: "approved" })}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDecision({ internship: i, status: "rejected" })}
                          >
                            Reject
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {isOpen && (
                      <Table.Row>
                        <Table.Cell
                          colSpan={5}
                          style={{
                            background: "var(--color-neutral-25)",
                            padding: "var(--space-4)",
                          }}
                        >
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-item__label">Duration</span>
                              <span className="detail-item__value">{i.duration}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-item__label">Payment</span>
                              <span className="detail-item__value">
                                <Coins size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--color-text-muted)" }} />
                                ฿{Number(i.paymentPerDay || 0).toLocaleString()} / day
                              </span>
                            </div>
                            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                              <span className="detail-item__label">Description</span>
                              <span className="detail-item__value" style={{ fontWeight: "var(--weight-regular)", color: "var(--color-text-muted)", whiteSpace: "pre-wrap" }}>
                                {i.description}
                              </span>
                            </div>
                            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                              <span className="detail-item__label">Qualifications</span>
                              <span className="detail-item__value" style={{ fontWeight: "var(--weight-regular)", color: "var(--color-text-muted)", whiteSpace: "pre-wrap" }}>
                                {i.qualifications}
                              </span>
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
            total={internships.length}
            onChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!decision}
        title={decision?.status === "approved" ? "Approve internship?" : "Reject internship?"}
        message={
          decision?.status === "approved"
            ? `Approve "${decision.internship.title}" by ${decision.internship.companyName}? It will be visible to students immediately.`
            : decision
              ? `Reject "${decision.internship.title}". Provide a reason — the company will see it and may edit and resubmit.`
              : ""
        }
        confirmLabel={decision?.status === "approved" ? "Approve" : "Reject"}
        confirmVariant={decision?.status === "rejected" ? "danger" : "primary"}
        requireReason={decision?.status === "rejected"}
        reasonPlaceholder="e.g. Description too vague, payment below minimum..."
        onConfirm={performDecision}
        onCancel={() => setDecision(null)}
      />
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// All Applications (read-only oversight)
// ────────────────────────────────────────────────────────────────────────────

function AllApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const data = await getAllApplications();
      setApplications(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { setPage(1); }, [filter]);

  const counts = useMemo(() => {
    const out = {
      all: applications.length,
      submitted: 0, "under-review": 0, accepted: 0,
      rejected: 0, confirmed: 0, withdrawn: 0,
    };
    for (const a of applications) {
      if (out[a.status] != null) out[a.status] += 1;
    }
    return out;
  }, [applications]);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);
  const pageItems = paginate(filtered, page, PAGE_SIZE);

  return (
    <section className="page-section">
      <div className="stat-grid">
        <div className="stat-tile stat-tile--violet">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Total applications</span>
            <span className="stat-tile__icon"><Database size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.all}</span>
          <span className="stat-tile__delta">across the system</span>
        </div>
        <div className="stat-tile stat-tile--warning">
          <div className="stat-tile__head">
            <span className="stat-tile__label">In review</span>
            <span className="stat-tile__icon"><Clock size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.submitted + counts["under-review"]}</span>
          <span className="stat-tile__delta">submitted or under review</span>
        </div>
        <div className="stat-tile stat-tile--success">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Accepted &amp; confirmed</span>
            <span className="stat-tile__icon"><CheckCircle2 size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.accepted + counts.confirmed}</span>
          <span className="stat-tile__delta">
            {counts.confirmed > 0 ? `${counts.confirmed} confirmed` : "offers extended"}
          </span>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__head">
            <span className="stat-tile__label">Closed</span>
            <span className="stat-tile__icon"><XCircle size={20} /></span>
          </div>
          <span className="stat-tile__value">{counts.rejected + counts.withdrawn}</span>
          <span className="stat-tile__delta">rejected or withdrawn</span>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "submitted", label: "Submitted", count: counts.submitted },
            { value: "under-review", label: "Under review", count: counts["under-review"] },
            { value: "accepted", label: "Accepted", count: counts.accepted },
            { value: "confirmed", label: "Confirmed", count: counts.confirmed },
            { value: "rejected", label: "Rejected", count: counts.rejected },
            { value: "withdrawn", label: "Withdrawn", count: counts.withdrawn },
          ]}
        />
      </div>

      {loading ? (
        <Card>
          <CardBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={42} style={{ marginBottom: 8 }} />
            ))}
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={22} />}
          title="No applications"
          description={
            filter === "all"
              ? "No applications exist in the system yet."
              : `No applications in the "${filter.replace("-", " ")}" status.`
          }
        />
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Student</Table.HeaderCell>
                <Table.HeaderCell>Internship</Table.HeaderCell>
                <Table.HeaderCell>Applied on</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
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
                      <Table.Cell style={{ color: "var(--color-text)" }}>
                        {app.internshipTitle}
                      </Table.Cell>
                      <Table.Cell style={{ color: "var(--color-text-muted)" }}>
                        {new Date(app.applyDate).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={app.status} />
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
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
