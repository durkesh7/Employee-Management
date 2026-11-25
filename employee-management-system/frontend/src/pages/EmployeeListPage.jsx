import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { employeeService } from "../api/services.js";
import { parseError } from "../api/client.js";
import useDebounce from "../hooks/useDebounce.js";
import { STATUSES } from "../utils/validators.js";
import Alert from "../components/Alert.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmployeeTable from "../components/EmployeeTable.jsx";
import Pagination from "../components/Pagination.jsx";
import StatCard from "../components/StatCard.jsx";

const PAGE_SIZE = 10;

export default function EmployeeListPage() {
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: "", department: "", status: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search);

  const loadSideData = useCallback(() => {
    employeeService.stats().then(setStats).catch((e) => setError(parseError(e).message));
    employeeService.departments().then(setDepartments).catch(() => {});
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filters.department) params.department = filters.department;
      if (filters.status) params.status = filters.status;
      setData(await employeeService.list(params));
      setError("");
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters.department, filters.status]);

  useEffect(loadSideData, [loadSideData]);
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const updateFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.remove(toDelete.id);
      setToDelete(null);
      // Step back a page if we just deleted the last item on this page.
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else loadEmployees();
      loadSideData();
    } catch (err) {
      setError(parseError(err).message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Employees" value={stats?.total} tone="blue" />
        <StatCard label="Active Employees" value={stats?.active} tone="green" />
        <StatCard label="Inactive Employees" value={stats?.inactive} tone="red" />
      </div>

      <div className="card">
        <div className="toolbar">
          <div>
            <h2>Employees</h2>
            <p className="muted">Manage employee records, search and filter.</p>
          </div>
          <Link to="/employees/new" className="btn btn-primary">
            + Add Employee
          </Link>
        </div>

        <div className="filters">
          <input
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          <select value={filters.department} onChange={(e) => updateFilter("department", e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <Alert onClose={() => setError("")}>{error}</Alert>

        {loading ? (
          <p className="center-msg">Loading...</p>
        ) : data.items.length === 0 ? (
          <p className="center-msg">No employees found.</p>
        ) : (
          <EmployeeTable employees={data.items} onDelete={setToDelete} />
        )}

        <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete employee"
          message={`Are you sure you want to delete ${toDelete.name}? This cannot be undone.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
