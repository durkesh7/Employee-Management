<<<<<<< HEAD

import { useEffect, useState } from "react";
import { employeeService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
=======
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

export default function DashboardPage() {
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
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  };

  useEffect(() => {
    fetchDashboard();

    // Refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);

    return () => clearInterval(interval);
  }, []);

  // Dynamic calculations
  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (emp) => emp.status?.toLowerCase() === "active"
  ).length;

  const inactiveEmployees = employees.filter(
    (emp) => emp.status?.toLowerCase() === "inactive"
  ).length;

  const departments = [
    ...new Set(
      employees
        .map((emp) => emp.department)
        .filter(Boolean)
    ),
  ];

  const departmentCounts = departments.map((department) => ({
    name: department,
    count: employees.filter(
      (emp) => emp.department === department
    ).length,
  }));

  if (loading) {
    return <p className="center-msg">Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Employee Management Overview</p>
        </div>

        <button onClick={fetchDashboard}>
          Refresh Data
        </button>
      </div>

      <Alert>{error}</Alert>

      {/* Summary Cards */}
      <div className="dashboard-cards">

        <div className="dashboard-card purple">
          <span>Total Employees</span>
          <h2>{totalEmployees}</h2>
          <p>All registered employees</p>
        </div>

        <div className="dashboard-card green">
          <span>Active Employees</span>
          <h2>{activeEmployees}</h2>
          <p>Currently active</p>
        </div>

        <div className="dashboard-card red">
          <span>Inactive Employees</span>
          <h2>{inactiveEmployees}</h2>
          <p>Currently inactive</p>
        </div>

        <div className="dashboard-card orange">
          <span>Departments</span>
          <h2>{departments.length}</h2>
          <p>Unique departments</p>
        </div>

      </div>

      {/* Department Statistics */}
      <div className="dashboard-section">
        <h3>Department Statistics</h3>

        {departmentCounts.length === 0 ? (
          <p>No department data available.</p>
        ) : (
          departmentCounts.map((department) => {
            const percentage =
              totalEmployees > 0
                ? (department.count / totalEmployees) * 100
                : 0;

            return (
              <div className="department-item" key={department.name}>
                <div className="department-info">
                  <span>{department.name}</span>
                  <strong>{department.count}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Employees */}
      <div className="dashboard-section">
        <h3>Recent Employees</h3>

        <div className="recent-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {employees.slice(-5).reverse().map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
=======
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
          <h2>Employees</h2>
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
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
  );
}
