export default function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value ?? "–"}</strong>
    </div>
  );
}
