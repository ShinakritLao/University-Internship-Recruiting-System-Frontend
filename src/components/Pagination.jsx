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
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {total}
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
          ← Prev
        </button>
        <span className="pagination-page">Page {page} of {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </button>
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
