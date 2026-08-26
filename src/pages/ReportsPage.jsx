import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSummaryOverview, getSummaryPerLokasi, getSummaryPerPetani } from "../api/reports";

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [perLokasi, setPerLokasi] = useState([]);
  const [perPetani, setPerPetani] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "dinas_pertanian") {
      setLoading(false);
      return;
    }

    Promise.all([getSummaryOverview(), getSummaryPerLokasi(), getSummaryPerPetani()])
      .then(([s, lokasi, petani]) => {
        setSummary(s);
        setPerLokasi(lokasi || []);
        setPerPetani(petani || []);
      })
      .catch(() => setError("Gagal memuat laporan."))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== "dinas_pertanian") {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
        <span className="text-4xl">🔒</span>
        <h3 className="text-xl font-bold text-slate-800">Akses Terbatas</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Halaman Laporan Rekapitulasi ini khusus diperuntukkan bagi akun <strong>Dinas Pertanian</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Laporan Rekapitulasi & Analytical DSS</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Ringkasan komprehensif produksi nanas Subang, komposisi mutu grade, serta rekomendasi penekanan food loss.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Memuat laporan rekapitulasi...</div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card label="Total Batch" value={summary.total_batch ?? 0} icon="📦" color="emerald" />
              <Card label="Total Nanas" value={summary.total_buah ?? 0} icon="🍍" color="teal" />
              <Card label="Total Berat" value={`${summary.total_berat_kg ?? 0} kg`} icon="⚖️" color="indigo" />
              <Card label="Food Loss (%)" value={`${summary.persentase_food_loss ?? 0}%`} icon="⚠️" color="rose" highlight />
              <Card label="Grade A (Ekspor)" value={summary.komposisi_grade?.grade_a_ekspor ?? 0} icon="👑" color="emerald" />
              <Card label="Grade B (Premium)" value={summary.komposisi_grade?.grade_b_premium_lokal ?? 0} icon="⭐" color="amber" />
              <Card label="Grade C (Standar)" value={summary.komposisi_grade?.grade_c_standar ?? 0} icon="🏷️" color="blue" />
              <Card label="Reject" value={summary.komposisi_grade?.reject ?? 0} icon="🚫" color="rose" />
            </div>
          )}

          <Section title="Rekapitulasi Hasil Grading per Kecamatan" icon="📍">
            <Table
              columns={["Kecamatan", "Jumlah Kebun", "Jumlah Petani", "Total Buah", "A / B / C / Reject"]}
              rows={perLokasi.map((r) => [
                <span className="font-bold text-slate-900">{r.kecamatan}</span>,
                `${r.jumlah_kebun} kebun`,
                `${r.jumlah_petani} petani`,
                <span className="font-bold text-emerald-800">{r.total_buah} buah</span>,
                <GradePill comp={r.komposisi_grade} />,
              ])}
            />
          </Section>

          <Section title="Rekapitulasi Produksi & Grade per Petani" icon="👨‍🌾">
            <Table
              columns={["Nama Petani", "Jumlah Kebun", "Total Batch", "Total Buah", "A / B / C / Reject"]}
              rows={perPetani.map((r) => [
                <span className="font-bold text-slate-900">{r.nama_petani}</span>,
                `${r.jumlah_kebun} kebun`,
                `${r.jumlah_batch} batch`,
                <span className="font-bold text-emerald-800">{r.total_buah} buah</span>,
                <GradePill comp={r.komposisi_grade} />,
              ])}
            />
          </Section>
        </>
      )}
    </div>
  );
}

function Card({ label, value, icon, color, highlight }) {
  const bgClasses = highlight
    ? "bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-lg shadow-rose-600/20 border-rose-500"
    : "bg-white text-slate-900 border-slate-200/80 shadow-xs hover:shadow-md";

  return (
    <div className={`rounded-2xl border p-5 transition flex flex-col justify-between ${bgClasses}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
          highlight ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}>
          {label}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function GradePill({ comp }) {
  if (!comp) return <span>-</span>;
  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">A: {comp.grade_a_ekspor ?? 0}</span>
      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">B: {comp.grade_b_premium_lokal ?? 0}</span>
      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">C: {comp.grade_c_standar ?? 0}</span>
      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">R: {comp.reject ?? 0}</span>
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {rows.length === 0 ? (
        <p className="p-8 text-center text-slate-400 text-sm">Belum ada data rekapitulasi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-6 py-4 font-semibold whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition">
                  {row.map((cell, j) => (
                    <td key={j} className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
