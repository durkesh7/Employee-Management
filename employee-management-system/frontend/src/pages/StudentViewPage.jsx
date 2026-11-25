import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { studentService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";

export default function StudentViewPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { studentService.get(id).then(setStudent).catch((err) => setError(parseError(err).message)); }, [id]);
  const rows = student && [
    ["Student ID", student.id], ["Student Name", student.student_name], ["Email", student.email],
    ["Phone Number", student.phone], ["Gender", student.gender], ["Date of Birth", student.date_of_birth],
    ["Department", student.department], ["Course", student.course], ["Year of Study", student.year_of_study],
    ["Address", student.address], ["Admission Date", student.admission_date],
  ];
  return (
    <div className="card form-card">
      <div className="toolbar"><h2>Student Details</h2><Link to="/students" className="btn btn-secondary">Back</Link></div>
      <Alert>{error}</Alert>
      {!student && !error && <p className="center-msg">Loading student...</p>}
      {student && <><dl className="details">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="form-actions"><Link to={`/students/${id}/edit`} className="btn btn-primary">Edit Student</Link></div></>}
    </div>
  );
}
