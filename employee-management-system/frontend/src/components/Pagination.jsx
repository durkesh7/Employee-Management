import Button from "./Button.jsx";

export default function Pagination({ page, pages, total, onChange }) {
  return (
    <div className="pagination">
      <span>
        Page {page} of {pages} · {total} employee{total === 1 ? "" : "s"}
      </span>
      <div className="pagination-buttons">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
