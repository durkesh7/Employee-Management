import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

export default function EmployeeTable({ employees, onDelete }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {["Name", "Email", "Phone", "Department", "Designation", "Joining Date", "Status", "Actions"].map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((e) => (
          <tr key={e.id}>
            <td data-label="Name">{e.name}</td>
            <td data-label="Email">{e.email}</td>
            <td data-label="Phone">{e.phone}</td>
            <td data-label="Department">{e.department}</td>
            <td data-label="Designation">{e.designation}</td>
            <td data-label="Joining Date">{e.joining_date}</td>
            <td data-label="Status">
              <StatusBadge status={e.status} />
            </td>
            <td data-label="Actions" className="actions">
              <Link to={`/employees/${e.id}`}>View</Link>
              <Link to={`/employees/${e.id}/edit`}>Edit</Link>
<<<<<<< HEAD
              <Link to={`/salaries/new?employee_id=${e.id}`}>Salary</Link>
=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
              <button className="link-danger" onClick={() => onDelete(e)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
