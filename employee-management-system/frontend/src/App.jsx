import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EmployeeFormPage from "./pages/EmployeeFormPage.jsx";
import EmployeeViewPage from "./pages/EmployeeViewPage.jsx";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
    </>
  );
}

export default function App() {
  const guarded = (page) => (
    <ProtectedRoute>
      <Layout>{page}</Layout>
    </ProtectedRoute>
  );
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={guarded(<DashboardPage />)} />
      <Route path="/employees/new" element={guarded(<EmployeeFormPage />)} />
      <Route path="/employees/:id" element={guarded(<EmployeeViewPage />)} />
      <Route path="/employees/:id/edit" element={guarded(<EmployeeFormPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
