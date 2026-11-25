import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { employeeService, salaryService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const money = (v) => (Number.isFinite(v) ? v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

export default function SalaryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [values, setValues] = useState({
    employee_id: params.get("employee_id") || "",
    salary_month: thisMonth(),
    basic_salary: "",
    hra: "0",
    allowances: "0",
    deductions: "0",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const page = await employeeService.list({ limit: 100 });
        setEmployees(page.items);
        if (isEdit) {
          const s = await salaryService.get(id);
          setValues({
            employee_id: String(s.employee_id),
            salary_month: s.salary_month,
            basic_salary: String(s.basic_salary),
            hra: String(s.hra),
            allowances: String(s.allowances),
            deductions: String(s.deductions),
          });
        }
      } catch (err) {
        setApiError(parseError(err).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const net = useMemo(() => {
    const n = (k) => Number(values[k]) || 0;
    return n("basic_salary") + n("hra") + n("allowances") - n("deductions");
  }, [values]);

  const change = (e) => {
    const { name, value } = e.target;
    setValues((cur) => ({ ...cur, [name]: value }));
    setErrors((cur) => ({ ...cur, [name]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError("");
    const next = {};
    if (!values.employee_id) next.employee_id = "Select an employee";
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.salary_month)) next.salary_month = "Select a month";
    if (!(Number(values.basic_salary) > 0)) next.basic_salary = "Enter a basic salary greater than 0";
    ["hra", "allowances", "deductions"].forEach((k) => {
      if (values[k] === "" || Number(values[k]) < 0) next[k] = "Enter 0 or more";
    });
    if (!next.basic_salary && !next.deductions && net < 0) {
      next.deductions = "Deductions cannot be more than total earnings";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const payload = {
        employee_id: Number(values.employee_id),
        salary_month: values.salary_month,
        basic_salary: values.basic_salary,
        hra: values.hra,
        allowances: values.allowances,
        deductions: values.deductions,
      };
      if (isEdit) await salaryService.update(id, payload);
      else await salaryService.create(payload);
      navigate("/salaries");
    } catch (err) {
      const parsed = parseError(err);
      setApiError(parsed.message);
      const { email, ...rest } = parsed.fieldErrors; // 409 maps to "email" in parseError; show it on the month field instead
      setErrors(email ? { ...rest, salary_month: email } : rest);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="center-msg">Loading...</p>;

  const num = (name, placeholder) => (
    <input name={name} type="number" min="0" step="0.01" value={values[name]} onChange={change} placeholder={placeholder} />
  );

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <h2>{isEdit ? "Edit Salary Details" : "Add Salary Details"}</h2>
      <p className="muted">Enter the monthly salary breakup. Net salary is calculated automatically.</p>
      <Alert>{apiError}</Alert>
      <div className="form-grid">
        <FormField label="Employee" required error={errors.employee_id}>
          <select name="employee_id" value={values.employee_id} onChange={change}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.department}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Salary Month" required error={errors.salary_month}>
          <input name="salary_month" type="month" value={values.salary_month} onChange={change} />
        </FormField>
        <FormField label="Basic Salary" required error={errors.basic_salary}>{num("basic_salary", "e.g. 30000")}</FormField>
        <FormField label="HRA" error={errors.hra}>{num("hra", "0")}</FormField>
        <FormField label="Allowances" error={errors.allowances}>{num("allowances", "0")}</FormField>
        <FormField label="Deductions" error={errors.deductions}>{num("deductions", "0")}</FormField>
      </div>
      <div className="net-box">
        <span>Net Salary</span>
        <strong>₹ {money(net)}</strong>
      </div>
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={() => navigate("/salaries")}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? "Save Changes" : "Add Salary"}
        </Button>
      </div>
    </form>
  );
}
