import { NavLink } from "react-router-dom";
import Icon from "./Icons.jsx";

const MENU = [
  { heading: "Main", items: [{ to: "/", label: "Dashboard", icon: "dashboard", end: true }] },
  {
    heading: "People",
    items: [
      { to: "/employees", label: "Employees", icon: "users" },
      { to: "/students", label: "Students", icon: "student" },
    ],
  },
  { heading: "Payroll", items: [{ to: "/salaries", label: "Salary Details", icon: "wallet" }] },
];

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile, user, onLogout }) {
  const initial = (user?.name || user?.email || "A").charAt(0).toUpperCase();
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-head">
          <span className="logo">E</span>
          <span className="sidebar-brand">Employee management</span>
          <button className="icon-btn sidebar-collapse" type="button" onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <Icon name="chevrons" size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {MENU.map((group) => (
            <div key={group.heading} className="menu-group">
              <p className="menu-heading">{group.heading}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  onClick={onCloseMobile}
                  className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}
                >
                  <Icon name={item.icon} />
                  <span className="menu-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar">{initial}</span>
            <div className="sidebar-user-info">
              <strong>{user?.name || "Admin"}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="menu-link logout-link" type="button" onClick={onLogout} title="Logout">
            <Icon name="logout" />
            <span className="menu-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
