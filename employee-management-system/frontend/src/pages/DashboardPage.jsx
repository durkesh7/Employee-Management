
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
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
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
  );
}
