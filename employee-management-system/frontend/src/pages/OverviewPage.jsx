import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const money = (v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function Donut({ active, inactive }) {
  const total = active + inactive;
  const r = 52;
  const c = 2 * Math.PI * r;
  const share = total ? active / total : 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`${active} active, ${inactive} inactive`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--red)" strokeWidth="16" opacity=".85" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke="var(--green)" strokeWidth="16"
          strokeDasharray={`${share * c} ${c}`} transform="rotate(-90 70 70)"
        />
        <text x="70" y="68" textAnchor="middle" className="donut-num">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="donut-sub">employees</text>
      </svg>
      <ul className="legend">
        <li><i style={{ background: "var(--green)" }} /> Active <strong>{active}</strong></li>
        <li><i style={{ background: "var(--red)" }} /> Inactive <strong>{inactive}</strong></li>
      </ul>
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await dashboardService.summary();
      setData(result);
    } catch (e) {
      setError(parseError(e).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const exportReport = () => {
    if (!data) return;
    const rows = [
      ["Employee Management System - Dashboard Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["Metric", "Value"],
      ["Total employees", data.employees.total],
      ["Active employees", data.employees.active],
      ["Inactive employees", data.employees.inactive],
      ["Students", data.students],
      ["Latest payroll", data.latest_payroll ? data.latest_payroll.total : "No payroll data"],
      [],
      ["Department", "Employee count"],
      ...data.departments.map((d) => [d.name, d.count]),
      [],
      ["Payroll month", "Net total"],
      ...data.payroll_trend.map((p) => [p.month, p.total]),
    ];
    const csv = rows.map((row) => row.map((cell) => {
      const value = String(cell ?? "");
      return `"${value.replace(/"/g, '""')}"`;
    }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ems-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxDept = Math.max(1, ...(data?.departments.map((d) => d.count) || [1]));
  const maxPay = Math.max(1, ...(data?.payroll_trend.map((p) => p.total) || [1]));

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Welcome back 👋</h2>
          <p className="muted">Here is what is happening in your organisation.</p>
        </div>
        <div className="quick-actions">
          <button type="button" className="btn btn-secondary" onClick={loadDashboard} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={exportReport} disabled={!data}>↓ Export CSV</button>
          <Link to="/employees/new" className="btn btn-primary">+ Employee</Link>
          <Link to="/students/new" className="btn btn-secondary">+ Student</Link>
          <Link to="/salaries/new" className="btn btn-secondary">+ Salary</Link>
        </div>
      </div>

      <Alert onClose={() => setError("")}>{error}</Alert>
      {loading && <div className="dashboard-loading" role="status">Updating dashboard data…</div>}

      <div className="stats-grid">
        <StatCard label="Total Employees" value={data?.employees.total} tone="blue" />
        <StatCard label="Active Employees" value={data?.employees.active} tone="green" />
        <StatCard label="Students" value={data?.students} tone="purple" />
        <StatCard
          label={data?.latest_payroll ? `Payroll · ${data.latest_payroll.month}` : "Latest Payroll"}
          value={data?.latest_payroll ? money(data.latest_payroll.total) : data ? "–" : undefined}
          tone="orange"
        />
      </div>

      <div className="grid-2">
        <section className="card">
          <h3>Employees by department</h3>
          {!data ? <p className="center-msg">Loading...</p> : data.departments.length === 0 ? <p className="center-msg">No data yet.</p> : (
            <ul className="bars">
              {data.departments.map((d) => (
                <li key={d.name}>
                  <span className="bar-label">{d.name}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(d.count / maxDept) * 100}%` }} /></div>
                  <strong>{d.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3>Employee status</h3>
          {!data ? <p className="center-msg">Loading...</p> : <Donut active={data.employees.active} inactive={data.employees.inactive} />}
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h3>Payroll trend <small className="muted">(last 6 months, net)</small></h3>
          {!data ? <p className="center-msg">Loading...</p> : data.payroll_trend.length === 0 ? (
            <p className="center-msg">No salary records yet. <Link to="/salaries/new">Add one</Link>.</p>
          ) : (
            <div className="columns">
              {data.payroll_trend.map((p) => (
                <div key={p.month} className="column" title={money(p.total)}>
                  <span className="column-val">{money(p.total)}</span>
                  <div className="column-bar" style={{ height: `${Math.max(6, (p.total / maxPay) * 100)}%` }} />
                  <span className="column-label">{p.month}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="toolbar">
            <h3>Recent joiners</h3>
            <Link to="/employees">View all</Link>
          </div>
          {!data ? <p className="center-msg">Loading...</p> : data.recent_hires.length === 0 ? <p className="center-msg">No employees yet.</p> : (
            <ul className="recent">
              {data.recent_hires.map((e) => (
                <li key={e.id}>
                  <span className="avatar">{e.name.charAt(0)}</span>
                  <div>
                    <Link to={`/employees/${e.id}`}><strong>{e.name}</strong></Link>
                    <small>{e.designation} · {e.department} · {e.joining_date}</small>
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
