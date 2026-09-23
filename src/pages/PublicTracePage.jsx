import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { traceBatch } from "../api/public";

export default function PublicTracePage() {
  const { kodeBatch } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    traceBatch(kodeBatch)
      .then(setData)
      .catch(() => setError("Kode batch tidak ditemukan atau sudah tidak berlaku."));
  }, [kodeBatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-800">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800/90 border border-emerald-500/40 shadow-xl shadow-emerald-950/60 text-2xl mb-3">
            🍍
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SIGANAS TRACE</h1>
          <p className="text-emerald-200/80 text-xs font-semibold uppercase tracking-wider mt-0.5">
            Sistem Traceability Digital Nanas Subang
          </p>
        </div>

        {/* Traceability Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/50 p-6 md:p-8 border border-white/20">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700 font-semibold text-sm">
              <span className="text-2xl block mb-2">⚠️</span>
              {error}
            </div>
          )}

          {!data && !error && (
            <div className="py-12 text-center text-slate-400 text-sm">
              <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
              <p>Memuat sertifikat keaslian & data traceability...</p>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Batch Code Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kode Batch Panen</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{data.kode_batch}</h2>
                </div>
                <VerifyBadge isValid={data.verifikasi_integritas?.is_valid} />
              </div>

              {/* Grid Metadata */}
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <MetaItem icon="📅" label="Tanggal Panen" value={new Date(data.tanggal_panen).toLocaleDateString("id-ID") || "-"} />
                <MetaItem icon="🚚" label="Status Distribusi" value={data.status_distribusi ? data.status_distribusi.replace("_", " ") : "-"} />
                <MetaItem icon="🏡" label="Kebun Asal" value={data.kebun?.nama_kebun || "-"} />
                <MetaItem icon="👤" label="Petani" value={data.kebun?.petani?.nama_lengkap || "-"} />
                <div className="col-span-2">
                  <MetaItem
                    icon="📍"
                    label="Detail Asal"
                    value={`Nanas dari kebun ${data.kebun?.nama_kebun} yang dikelola oleh ${data.kebun?.petani?.nama_lengkap}.`}
                  />
                </div>
              </dl>

              {/* Grade Composition */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>📊</span> Rekapitulasi Mutu Batch
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <GradeCell label="Grade A" value={data.jumlah_grade_a} color="bg-emerald-100 text-emerald-800 border-emerald-200" />
                  <GradeCell label="Grade B" value={data.jumlah_grade_b} color="bg-amber-100 text-amber-800 border-amber-200" />
                  <GradeCell label="Grade C" value={data.jumlah_grade_c} color="bg-blue-100 text-blue-800 border-blue-200" />
                  <GradeCell label="Reject" value={data.jumlah_reject} color="bg-rose-100 text-rose-800 border-rose-200" />
                </div>
              </div>

              {/* Blockchain Footer Keterangan */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
                <p className="text-[11px] font-medium text-slate-500">
                  {data.verifikasi_integritas?.keterangan || "Terdaftar pada Blockchain Ledger SHA-256 SIGANAS"}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-emerald-200/60 mt-6">
          © {new Date().getFullYear()} SIGANAS • Traceability System Nanas Subang
        </p>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <span className="text-slate-400 font-bold block mb-0.5">{icon} {label}</span>
      <span className="font-bold text-slate-800 text-sm">{value}</span>
    </div>
  );
}

function GradeCell({ label, value, color }) {
  return (
    <div className={`rounded-xl py-3 px-1 border ${color}`}>
      <p className="text-[11px] font-bold">{label}</p>
      <p className="text-lg font-black mt-0.5">{value ?? 0}</p>
    </div>
  );
}

function VerifyBadge({ isValid }) {
  if (isValid === undefined || isValid === null) return null;
  return (
    <span
      className={`text-xs font-bold rounded-full px-3 py-1.5 flex items-center gap-1 shadow-xs ${
        isValid ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
      }`}
    >
      {isValid ? "✓ Blockchain Verified" : "⚠ Untrusted Data"}
    </span>
  );
}
