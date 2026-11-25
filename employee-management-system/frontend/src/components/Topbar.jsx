import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Icon from "./Icons.jsx";


const titleFor = (path) => {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/employees")) return "Employees";
  if (path.startsWith("/students")) return "Students";
  if (path.startsWith("/salaries")) return "Salary Details";
  return "EMS";
};

export default function Topbar({ onOpenMenu, theme, onToggleTheme, user, onLogout }) {
  const { pathname } = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const initial = (user?.name || user?.email || "A").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <button className="icon-btn menu-toggle" type="button" onClick={onOpenMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className="topbar-heading">
        <h1 className="topbar-title">{titleFor(pathname)}</h1>
        <p className="topbar-date">{today}</p>
      </div>
      <div className="topbar-tools">
        <Link className="topbar-shortcut" to="/employees/new"><Icon name="plus" size={6} /><span>New employee</span></Link>
        <button className="icon-btn theme-toggle" type="button" onClick={onToggleTheme}
          aria-label="Toggle dark mode" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <div className="profile-wrap">
          {profileOpen && (
            <>
              <button type="button" className="dropdown-dismiss" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
              <div className="profile-menu">
                <div className="profile-menu-head">
                  <span className="avatar">{initial}</span>
                  <div><strong>{user?.name || "Administrator"}</strong><small>{user?.email || "Signed in"}</small></div>
                </div>
                <div className="profile-menu-divider" />
                <button type="button" className="profile-menu-item logout-action" onClick={onLogout}>Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
