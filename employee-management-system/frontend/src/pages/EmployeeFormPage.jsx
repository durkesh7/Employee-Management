<<<<<<< HEAD

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";

export default function EmployeesPage() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await employeeService.getAll();

      setEmployees(Array.isArray(data) ? data : []);
      setSelectedEmployees([]);
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search employees
  const filteredEmployees = employees.filter((emp) => {
    const value = search.toLowerCase();

    return (
      String(emp.name || "").toLowerCase().includes(value) ||
      String(emp.email || "").toLowerCase().includes(value) ||
      String(emp.department || "").toLowerCase().includes(value) ||
      String(emp.designation || "").toLowerCase().includes(value)
    );
  });

  // Select all visible employees
  const handleSelectAll = (checked) => {
    const visibleIds = filteredEmployees.map((emp) => emp.id);

    if (checked) {
      setSelectedEmployees((prev) => [
        ...new Set([...prev, ...visibleIds]),
      ]);
    } else {
      setSelectedEmployees((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    }
  };

  // Select one employee
  const handleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Delete one employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setError("");
      await employeeService.delete(id);
      await fetchEmployees();
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  // Delete selected employees
  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) {
      setError("Please select at least one employee.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedEmployees.length} employees?`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    const failedIds = [];

    try {
      for (const id of selectedEmployees) {
        try {
          await employeeService.delete(id);
        } catch {
          failedIds.push(id);
        }
      }

      await fetchEmployees();

      if (failedIds.length > 0) {
        setError(
          `Failed to delete ${failedIds.length} employee(s).`
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const allSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) =>
      selectedEmployees.includes(emp.id)
    );

  if (loading) {
    return <p className="center-msg">Loading employees...</p>;
  }

  return (
    <div className="card employees-card">

      {/* Header */}
      <div className="employees-header">
        <div>
          <h2>Employee Management</h2>
          <p>Manage all employee records</p>
        </div>

        <Button onClick={() => navigate("/employees/new")}>
          + Add Employee
        </Button>
      </div>

      <Alert>{error}</Alert>

      {/* Search and actions */}
      <div className="employee-toolbar">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="secondary"
          onClick={fetchEmployees}
        >
          Refresh
        </Button>

        <Button
          variant="danger"
          disabled={selectedEmployees.length === 0 || deleting}
          loading={deleting}
          onClick={handleBulkDelete}
        >
          Delete Selected ({selectedEmployees.length})
        </Button>
      </div>

      {/* Employee table */}
      <div className="table-wrap">
        <table className="employee-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) =>
                    handleSelectAll(e.target.checked)
                  }
                  aria-label="Select all employees"
                />
              </th>

              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => handleSelectEmployee(emp.id)}
                      aria-label={`Select ${emp.name}`}
                    />
                  </td>

                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>

                  <td>
                    <span
                      className={
                        emp.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="employee-actions">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(`/employees/${emp.id}/edit`)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      disabled={deleting}
                      onClick={() => handleDelete(emp.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="employee-summary">
        <span>Total Employees: {employees.length}</span>
        <span>Selected Employees: {selectedEmployees.length}</span>
        <span>Showing: {filteredEmployees.length}</span>
      </div>

    </div>
=======
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employeeService } from "../api/services.js";
import { parseError } from "../api/client.js";
import { DEPARTMENT_SUGGESTIONS, STATUSES, validateEmployee } from "../utils/validators.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

const EMPTY = { name: "", email: "", phone: "", department: "", designation: "", joining_date: "", status: "Active" };

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    employeeService
      .get(id)
      .then((emp) => setValues({ ...EMPTY, ...emp }))
      .catch((err) => setApiError(parseError(err).message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const found = validateEmployee(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        department: values.department.trim(),
        designation: values.designation.trim(),
        joining_date: values.joining_date,
        status: values.status,
      };
      if (isEdit) await employeeService.update(id, payload);
      else await employeeService.create(payload);
      navigate("/");
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="center-msg">Loading...</p>;

  const input = (name, type = "text", extra = {}) => (
    <input name={name} type={type} value={values[name]} onChange={handleChange} {...extra} />
  );

  return (
    <form className="card form-card" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? "Edit Employee" : "Add Employee"}</h2>
      <Alert>{apiError}</Alert>
      <div className="form-grid">
        <FormField label="Name" error={errors.name} required>
          {input("name")}
        </FormField>
        <FormField label="Email" error={errors.email} required>
          {input("email", "email")}
        </FormField>
        <FormField label="Phone" error={errors.phone} required>
          {input("phone", "tel", { placeholder: "+919876543210" })}
        </FormField>
        <FormField label="Department" error={errors.department} required>
          {input("department", "text", { list: "dept-list" })}
          <datalist id="dept-list">
            {DEPARTMENT_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Designation" error={errors.designation} required>
          {input("designation")}
        </FormField>
        <FormField label="Joining Date" error={errors.joining_date} required>
          {input("joining_date", "date")}
        </FormField>
        <FormField label="Status" error={errors.status} required>
          <select name="status" value={values.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? "Save Changes" : "Add Employee"}
        </Button>
      </div>
    </form>
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
  );
}
