import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Simple pagination component.
 *
 * Props:
 *   page       - current page (1-indexed)
 *   pageSize   - items per page
 *   total      - total item count
 *   onChange   - (newPage: number) => void
 */
export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        marginTop: "var(--space-5)",
        padding: "var(--space-3) 0",
      }}
    >
      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Showing <strong style={{ color: "var(--color-text)" }}>{start}–{end}</strong> of {total}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          leadingIcon={<ChevronLeft size={14} />}
        >
          Prev
        </Button>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", padding: "0 var(--space-2)" }}>
          Page <strong style={{ color: "var(--color-text)" }}>{page}</strong> of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          trailingIcon={<ChevronRight size={14} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/**
 * Helper: slice an array for the current page.
 */
export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
