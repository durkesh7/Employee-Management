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
  );
}
