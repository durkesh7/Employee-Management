import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(read("ems_sidebar", "open") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(read("ems_theme", "light"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("ems_theme", theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("ems_sidebar", collapsed ? "collapsed" : "open"); } catch { /* ignore */ }
  }, [collapsed]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`app-shell${collapsed ? " is-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <Topbar
          onOpenMenu={() => setMobileOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          user={user}
          onLogout={handleLogout}
        />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
