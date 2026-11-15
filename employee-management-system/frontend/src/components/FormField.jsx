export default function FormField({ label, error, required, children }) {
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      <label>
        {label} {required && <span className="req">*</span>}
      </label>
      {children}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}
