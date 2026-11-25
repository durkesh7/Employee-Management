import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { salaryService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const money = (v) => Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SalaryListPage() {
  const [rows, setRows] = useState([]);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await salaryService.list(month ? { month } : {}));
      setError("");
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [month]);
  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    setDeleting(true);
    try {
      await salaryService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(parseError(err).message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const headers = ["Employee", "Department", "Month", "Basic", "HRA", "Allowances", "Deductions", "Net Salary", "Actions"];

  return (
    <>
      <div className="student-heading">
        <div>
          <h2>Salary Details</h2>
          <p className="muted">Add and manage monthly salary records for employees.</p>
        </div>
        <Link to="/salaries/new" className="btn btn-primary">+ Add Salary</Link>
      </div>
      <div className="card">
        <div className="student-toolbar">
          <input type="month" aria-label="Filter by month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <span className="student-count">Records: <strong>{rows.length}</strong></span>
        </div>
        <Alert onClose={() => setError("")}>{error}</Alert>
        {loading ? (
          <p className="center-msg">Loading salary records...</p>
        ) : rows.length === 0 ? (
          <p className="center-msg">No salary records found. Add the first one.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Employee">{s.employee_name}</td>
                    <td data-label="Department">{s.employee_department}</td>
                    <td data-label="Month">{s.salary_month}</td>
                    <td data-label="Basic">{money(s.basic_salary)}</td>
                    <td data-label="HRA">{money(s.hra)}</td>
                    <td data-label="Allowances">{money(s.allowances)}</td>
                    <td data-label="Deductions">{money(s.deductions)}</td>
                    <td data-label="Net Salary"><strong>{money(s.net_salary)}</strong></td>
                    <td data-label="Actions" className="actions">
                      <Link to={`/salaries/${s.id}/edit`}>Edit</Link>
                      <button className="link-danger" onClick={() => setToDelete(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toDelete && (
        <ConfirmDialog
          title="Delete salary record"
          message={`Delete the ${toDelete.salary_month} salary record of ${toDelete.employee_name}? This cannot be undone.`}
          loading={deleting}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
