import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../api/services.js";
import { parseError } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setStudents(await studentService.list()); setError(""); }
    catch (err) { setError(parseError(err).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => [s.student_name, s.email, s.department, s.course].some((v) => v.toLowerCase().includes(q)));
  }, [students, search]);

  const remove = async () => {
    setDeleting(true);
    try { await studentService.remove(toDelete.id); setToDelete(null); await load(); }
    catch (err) { setError(parseError(err).message); setToDelete(null); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <div className="student-heading">
        <div><h2>Student Information</h2><p className="muted">Add, view, edit and manage student records.</p></div>
        <Link to="/students/new" className="btn btn-primary">+ Add Student</Link>
      </div>
      <div className="card">
        <div className="student-toolbar">
          <input aria-label="Search students" placeholder="Search by name, email, department or course" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="student-count">Total Students: <strong>{students.length}</strong></span>
        </div>
        <Alert onClose={() => setError("")}>{error}</Alert>
        {loading ? <p className="center-msg">Loading students...</p> : filtered.length === 0 ? <p className="center-msg">No students found. Add your first student.</p> : (
          <div className="table-wrap"><table className="table">
            <thead><tr>{["Student Name", "Email", "Phone", "Department", "Course", "Year", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((s) => (
              <tr key={s.id}>
                <td data-label="Student Name">{s.student_name}</td><td data-label="Email">{s.email}</td><td data-label="Phone">{s.phone}</td>
                <td data-label="Department">{s.department}</td><td data-label="Course">{s.course}</td><td data-label="Year">{s.year_of_study}</td>
                <td data-label="Actions" className="actions"><Link to={`/students/${s.id}`}>View</Link><Link to={`/students/${s.id}/edit`}>Edit</Link><button className="link-danger" onClick={() => setToDelete(s)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {toDelete && <ConfirmDialog title="Delete student" message={`Are you sure you want to delete ${toDelete.student_name}? This cannot be undone.`} loading={deleting} onConfirm={remove} onCancel={() => setToDelete(null)} />}
    </>
  );
}
