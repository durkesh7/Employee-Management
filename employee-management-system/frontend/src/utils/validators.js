export const STATUSES = ["Active", "Inactive"];
export const DEPARTMENT_SUGGESTIONS = ["Engineering", "IT", "HR", "Finance", "Marketing", "Sales", "Operations"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9]{10,15}$/;

export function validateEmail(value) {
  if (!value.trim()) return "Email is required";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address";
  return "";
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = "Password is required";
  return errors;
}

export function validateEmployee(values) {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const phone = values.phone.replace(/[\s\-()]/g, "");
  if (!phone) errors.phone = "Phone is required";
  else if (!PHONE_RE.test(phone)) errors.phone = "Phone must contain 10-15 digits, optionally starting with +";

  if (values.department.trim().length < 2) errors.department = "Department is required";
  if (values.designation.trim().length < 2) errors.designation = "Designation is required";

  if (!values.joining_date) errors.joining_date = "Joining date is required";
  else {
    const d = new Date(values.joining_date);
    const max = new Date();
    max.setFullYear(max.getFullYear() + 1);
    if (Number.isNaN(d.getTime()) || d < new Date("1990-01-01")) errors.joining_date = "Enter a valid joining date";
    else if (d > max) errors.joining_date = "Joining date cannot be more than one year in the future";
  }

  if (!STATUSES.includes(values.status)) errors.status = "Select Active or Inactive";
  return errors;
}
