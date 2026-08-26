import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSummaryOverview } from "../api/reports";
import { listBatches } from "../api/batches";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-8 shadow-xl shadow-emerald-900/10 border border-emerald-600/30">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 text-9xl pointer-events-none select-none">
          🍍
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 uppercase tracking-wider mb-3 shadow-xs">
              ★ SIGANAS Dashboard
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Selamat datang kembali, {user?.nama_lengkap || "Pengguna"} 👋
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              Sistem Digital Grading & Traceability Buah Nanas Multi-Tier Subang. Pantau ketersediaan batch panen dan performa mutu buah secara real-time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/dashboard/batches"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-400/20"
            >
              <span>+ Input Batch Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-600 rounded-full"></span>
            Ringkasan Statistik Grading
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi data panen, distribusi grade, dan angka food loss.
          </p>
        </div>

        {user?.role === "dinas_pertanian" && <DinasSummary />}
        
        <div className="pt-4">
          <UserSummary />
        </div>
      </div>
    </div>
  );
}

function DinasSummary() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSummaryOverview()
      .then(setSummary)
      .catch(() => setError("Gagal memuat ringkasan laporan."));
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Batch",
      value: summary?.total_batch ?? 0,
      unit: "batch",
      badge: "Total Panen",
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "📦",
    },
    {
      label: "Total Nanas",
      value: summary?.total_buah ?? 0,
      unit: "buah",
      badge: "Volume",
      gradient: "from-teal-600 to-cyan-600",
      bgLight: "bg-teal-50 text-teal-700 border-teal-200",
      icon: "🍍",
    },
    {
      label: "Grade A",
      value: summary?.komposisi_grade?.grade_a_ekspor ?? 0,
      unit: "buah",
      badge: "Ekspor",
      gradient: "from-emerald-600 to-green-600",
      bgLight: "bg-emerald-100/70 text-emerald-800 border-emerald-300",
      icon: "👑",
    },
    {
      label: "Grade B",
      value: summary?.komposisi_grade?.grade_b_premium_lokal ?? 0,
      unit: "buah",
      badge: "Premium",
      gradient: "from-amber-500 to-yellow-600",
      bgLight: "bg-amber-50 text-amber-800 border-amber-200",
      icon: "⭐",
    },
    {
      label: "Grade C",
      value: summary?.komposisi_grade?.grade_c_standar ?? 0,
      unit: "buah",
      badge: "Standar",
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-700 border-blue-200",
      icon: "🏷️",
    },
    {
      label: "Food Loss",
      value: `${summary?.persentase_food_loss ?? 0}%`,
      unit: "estimasi",
      badge: "Reject",
      gradient: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "⚠️",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
        >
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${c.gradient}`}></div>
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xl">{c.icon}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${c.bgLight}`}>
                {c.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
          </div>

          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">
              {c.value}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{c.unit}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserSummary() {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBatches()
      .then((data) => setBatches(data || []))
      .catch(() => setError("Gagal memuat daftar batch."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>📋</span> Batch Panen Terbaru
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">5 batch panen terkini yang terdaftar di sistem</p>
        </div>
        <Link
          to="/dashboard/batches"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
        >
          Lihat Semua Batch →
        </Link>
      </div>

      {error ? (
        <p className="text-rose-600 text-sm mt-4">{error}</p>
      ) : loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Memuat data batch...</div>
      ) : batches.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">Belum ada batch panen terdaftar.</div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-3 font-semibold">Kode Batch</th>
                <th className="py-3 px-3 font-semibold">Total Buah</th>
                <th className="py-3 px-3 font-semibold">Status Distribusi</th>
                <th className="py-3 px-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {batches.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3 font-bold text-emerald-800">{b.kode_batch}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{b.total_buah ?? 0} buah</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      {b.status_distribusi || "Proses"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/dashboard/batches/${b.id}`}
                      className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
