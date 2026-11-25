import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { studentService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

const EMPTY = {
  student_name: "", email: "", phone: "", gender: "", date_of_birth: "",
  department: "", course: "", year_of_study: "1", address: "", admission_date: "",
};

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    studentService.get(id)
      .then((student) => setValues({ ...EMPTY, ...student, date_of_birth: student.date_of_birth, admission_date: student.admission_date, year_of_study: String(student.year_of_study) }))
      .catch((err) => setApiError(parseError(err).message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const change = (e) => {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError("");
    const required = ["student_name", "email", "phone", "gender", "date_of_birth", "department", "course", "year_of_study", "address", "admission_date"];
    const nextErrors = {};
    required.forEach((key) => { if (!String(values[key] ?? "").trim()) nextErrors[key] = "This field is required"; });
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = "Enter a valid email address";
    if (values.phone && !/^\+?[0-9\s()-]{10,20}$/.test(values.phone)) nextErrors.phone = "Enter a valid phone number";
    if (values.year_of_study && (!Number.isInteger(Number(values.year_of_study)) || Number(values.year_of_study) < 1 || Number(values.year_of_study) > 10)) nextErrors.year_of_study = "Enter a year from 1 to 10";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const payload = { ...values, student_name: values.student_name.trim(), email: values.email.trim(), phone: values.phone.trim(), department: values.department.trim(), course: values.course.trim(), address: values.address.trim(), year_of_study: Number(values.year_of_study) };
      if (isEdit) await studentService.update(id, payload);
      else await studentService.create(payload);
      navigate("/students");
    } catch (err) {
      const parsed = parseError(err);
      setApiError(parsed.message);
      setErrors(parsed.fieldErrors);
    } finally { setSubmitting(false); }
  };

  if (loading) return <p className="center-msg">Loading student...</p>;
  const field = (name, type = "text", props = {}) => <input name={name} type={type} value={values[name]} onChange={change} {...props} />;

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <h2>{isEdit ? "Edit Student Information" : "Add Student Information"}</h2>
      <p className="muted">Enter the student's personal and academic details.</p>
      <Alert>{apiError}</Alert>
      <div className="form-grid">
        <FormField label="Student Name" required error={errors.student_name}>{field("student_name", "text", { placeholder: "Enter full name" })}</FormField>
        <FormField label="Email" required error={errors.email}>{field("email", "email", { placeholder: "student@example.com" })}</FormField>
        <FormField label="Phone Number" required error={errors.phone}>{field("phone", "tel", { placeholder: "+919876543210" })}</FormField>
        <FormField label="Gender" required error={errors.gender}>
          <select name="gender" value={values.gender} onChange={change}>
            <option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </FormField>
        <FormField label="Date of Birth" required error={errors.date_of_birth}>{field("date_of_birth", "date")}</FormField>
        <FormField label="Department" required error={errors.department}>{field("department", "text", { placeholder: "e.g. Computer Science" })}</FormField>
        <FormField label="Course" required error={errors.course}>{field("course", "text", { placeholder: "e.g. B.Sc Computer Science" })}</FormField>
        <FormField label="Year of Study" required error={errors.year_of_study}>
          <select name="year_of_study" value={values.year_of_study} onChange={change}>
            {[1,2,3,4,5,6,7,8,9,10].map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </FormField>
        <FormField label="Admission Date" required error={errors.admission_date}>{field("admission_date", "date")}</FormField>
        <FormField label="Address" required error={errors.address}>
          <textarea name="address" value={values.address} onChange={change} rows="3" placeholder="Enter student address" />
        </FormField>
      </div>
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={() => navigate("/students")}>Cancel</Button>
        <Button type="submit" loading={submitting}>{isEdit ? "Save Changes" : "Add Student"}</Button>
      </div>
    </form>
  );
}
