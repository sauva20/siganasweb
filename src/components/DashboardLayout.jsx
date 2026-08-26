import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_LABEL = {
  petani: "Petani",
  pengepul: "Pengepul",
  eksportir: "Eksportir",
  pabrik: "Pabrik",
  dinas_pertanian: "Dinas Pertanian",
};

const MENU_ICONS = {
  "/dashboard": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  "/dashboard/kebun": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1.5a2.5 2.5 0 002.5 2.5h.5a2 2 0 012 2v.5h.5a2.5 2.5 0 002.5-2.5V12a9 9 0 10-9-9z" />
    </svg>
  ),
  "/dashboard/batches": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  "/dashboard/reports": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

function getMenuForRole(role) {
  const items = [
    { to: "/dashboard", label: "Ringkasan", end: true },
    { to: "/dashboard/kebun", label: "Kebun & Petani" },
    { to: "/dashboard/batches", label: "Batch Panen" },
  ];
  if (role === "dinas_pertanian") {
    items.push({ to: "/dashboard/reports", label: "Laporan" });
  }
  return items;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const menu = getMenuForRole(user?.role);

  const initial = user?.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full md:w-72 min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white flex flex-col shrink-0 shadow-xl border-r border-emerald-800/40 z-20">
        {/* Brand Logo Header */}
        <div className="px-6 py-6 border-b border-emerald-800/40 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 border border-emerald-500/40 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-950/50">
            🍍
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              SIGANAS
            </h1>
            <p className="text-xs font-medium text-emerald-300/80 tracking-wide uppercase">
              Grading Nanas Subang
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-emerald-400/70 tracking-wider uppercase mb-2">
            Menu Utama
          </p>
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/50 border border-emerald-500/30"
                    : "text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-amber-300" : "text-emerald-400/80"}>
                    {MENU_ICONS[item.to] || null}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sticky User Card at Bottom of Viewport/Sidebar */}
        <div className="p-4 border-t border-emerald-800/40 bg-emerald-950/90 backdrop-blur-sm sticky bottom-0 mt-auto">
          <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-amber-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40 shadow-inner">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {user?.nama_lengkap || "User"}
                </p>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-emerald-200 bg-emerald-800/80 rounded-md border border-emerald-600/30 mt-0.5">
                  {ROLE_LABEL[user?.role] || user?.role || "Pengguna"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar"
              className="p-2 text-emerald-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/90">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500">Sistem Digital Grading Nanas</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200/60 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <span className="text-base">📍</span> Subang, Jawa Barat
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
