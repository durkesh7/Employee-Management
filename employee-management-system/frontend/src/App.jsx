import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import EmployeeListPage from "./pages/EmployeeListPage.jsx";
import StudentListPage from "./pages/StudentListPage.jsx";
import EmployeeFormPage from "./pages/EmployeeFormPage.jsx";
import EmployeeViewPage from "./pages/EmployeeViewPage.jsx";
import StudentFormPage from "./pages/StudentFormPage.jsx";
import StudentViewPage from "./pages/StudentViewPage.jsx";
import SalaryListPage from "./pages/SalaryListPage.jsx";
import SalaryFormPage from "./pages/SalaryFormPage.jsx";

export default function App() {
  const guarded = (page) => (
    <ProtectedRoute>
      <AppLayout>{page}</AppLayout>
    </ProtectedRoute>
  );
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={guarded(<OverviewPage />)} />
      <Route path="/employees" element={guarded(<EmployeeListPage />)} />
      <Route path="/employees/new" element={guarded(<EmployeeFormPage />)} />
      <Route path="/employees/:id" element={guarded(<EmployeeViewPage />)} />
      <Route path="/employees/:id/edit" element={guarded(<EmployeeFormPage />)} />
      <Route path="/students" element={guarded(<StudentListPage />)} />
      <Route path="/students/new" element={guarded(<StudentFormPage />)} />
      <Route path="/students/:id" element={guarded(<StudentViewPage />)} />
      <Route path="/students/:id/edit" element={guarded(<StudentFormPage />)} />
      <Route path="/salaries" element={guarded(<SalaryListPage />)} />
      <Route path="/salaries/new" element={guarded(<SalaryFormPage />)} />
      <Route path="/salaries/:id/edit" element={guarded(<SalaryFormPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
