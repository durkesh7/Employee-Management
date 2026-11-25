import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { parseError } from "../api/client.js";
import { validateLogin } from "../utils/validators.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      navigate("/", { replace: true });
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={handleSubmit} noValidate>
        <h2>Employee Management</h2>
        <p className="muted">Sign in to continue</p>
        <Alert>{apiError}</Alert>
        <FormField label="Email" error={errors.email} required>
          <input name="email" type="email" value={values.email} onChange={handleChange} autoComplete="username" />
        </FormField>
        <FormField label="Password" error={errors.password} required>
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </FormField>
        <Button type="submit" loading={submitting}>
          Login
        </Button>
      </form>
    </div>
  );
}
