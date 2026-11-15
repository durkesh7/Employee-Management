import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { employeeService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function EmployeeViewPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    employeeService.get(id).then(setEmployee).catch((err) => setError(parseError(err).message));
  }, [id]);

  const rows = employee && [
    ["Name", employee.name],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Department", employee.department],
    ["Designation", employee.designation],
    ["Joining Date", employee.joining_date],
    ["Status", <StatusBadge status={employee.status} />],
  ];

  return (
    <div className="card form-card">
      <div className="toolbar">
        <h2>Employee Details</h2>
        <Link to="/" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <Alert>{error}</Alert>
      {!employee && !error && <p className="center-msg">Loading...</p>}
      {employee && (
        <>
          <dl className="details">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="form-actions">
            <Link to={`/employees/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
