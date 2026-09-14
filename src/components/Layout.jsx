import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_BY_ROLE = {
  admin: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/members", label: "Members" },
    { to: "/schedules", label: "Group schedules" },
    { to: "/sunday-attendance", label: "Sunday attendance" },
    { to: "/reports", label: "Discipleship reports" },
    { to: "/users", label: "Manage users" },
  ],
  staff: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/members", label: "Members" },
    { to: "/schedules", label: "Group schedules" },
    { to: "/sunday-attendance", label: "Sunday attendance" },
    { to: "/reports", label: "Discipleship reports" },
    { to: "/users", label: "Leader & staff requests" },
  ],
  leader: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/members", label: "My members" },
    { to: "/schedules", label: "My group schedules" },
  ],
};

const ROLE_LABEL = { admin: "Admin", staff: "Staff", leader: "Group Leader" };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = NAV_BY_ROLE[user?.role] || [];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-ink px-4 py-3 text-paper lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-sm p-1.5 hover:bg-paper/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <p className="font-display text-base">Victory Church</p>
        <div className="w-[22px]" />
      </div>

      {/* Backdrop (mobile only, shown when menu is open) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 transform flex-col bg-ink text-paper transition-transform duration-200 ease-in-out
        lg:static lg:z-auto lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-paper/10 px-6 py-6">
          <div>
            <p className="font-display text-lg leading-tight">Victory Church</p>
            <p className="text-xs text-paper/60">Discipleship & Attendance</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-sm p-1 text-paper/70 hover:bg-paper/10 hover:text-paper lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-paper/10 text-paper font-medium"
                    : "text-paper/70 hover:bg-paper/5 hover:text-paper"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-paper/10 px-6 py-4">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-paper/60">{ROLE_LABEL[user?.role]}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-paper/70 hover:text-paper hover:underline"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-paper px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
