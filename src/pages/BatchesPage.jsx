import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listBatches, createBatch } from "../api/batches";
import { listKebun } from "../api/kebun";

export default function BatchesPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "petani" || user?.role === "dinas_pertanian" || !user?.role;

  const [batches, setBatches] = useState([]);
  const [kebunList, setKebunList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kebun_id: "", tanggal_panen: "", catatan: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function loadBatches() {
    setIsLoading(true);
    listBatches()
      .then((data) => setBatches(data || []))
      .catch(() => setError("Gagal memuat daftar batch."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadBatches();
    if (canCreate) {
      listKebun().then((data) => setKebunList(data || [])).catch(() => {});
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createBatch({
        kebun_id: parseInt(form.kebun_id, 10),
        tanggal_panen: form.tanggal_panen,
        catatan: form.catatan || null,
      });
      setForm({ kebun_id: "", tanggal_panen: "", catatan: "" });
      setShowForm(false);
      loadBatches();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal membuat batch.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Batch Panen Nanas</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Daftar kelompok panen, hasil scanning AI grading, dan riwayat status rantai pasok.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <span>{showForm ? "✕ Batal" : "+ Buat Batch Panen"}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Form Drawer / Card */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-lg mb-6 space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-amber-500"></div>

          <h3 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>🏷️</span> Form Registrasi Batch Panen Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kebun Asal
              </label>
              <select
                required
                value={form.kebun_id}
                onChange={(e) => setForm((f) => ({ ...f, kebun_id: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              >
                <option value="">Pilih kebun...</option>
                {kebunList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kebun} {k.kecamatan ? `(${k.kecamatan})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Panen
              </label>
              <input
                type="date"
                required
                value={form.tanggal_panen}
                onChange={(e) => setForm((f) => ({ ...f, tanggal_panen: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Panen (Opsional)
            </label>
            <input
              value={form.catatan}
              onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
              placeholder="Contoh: Panen sesi pagi, kondisi matang optimal"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-6 py-2.5 text-sm transition shadow-md shadow-emerald-800/20"
            >
              Simpan Batch Panen
            </button>
          </div>
        </form>
      )}

      {/* Batches Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat daftar batch panen...</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada batch panen terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode Batch</th>
                  <th className="px-6 py-4 font-semibold">Tanggal Panen</th>
                  <th className="px-6 py-4 font-semibold">Status Distribusi</th>
                  <th className="px-6 py-4 font-semibold">Total Buah</th>
                  <th className="px-6 py-4 font-semibold">Komposisi Grade (A / B / C / Reject)</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-emerald-800 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        🏷️
                      </span>
                      {b.kode_batch}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      📅 {b.tanggal_panen || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        {b.status_distribusi || "Diproses"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {b.total_buah ?? 0} <span className="font-normal text-xs text-slate-500">buah</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800" title="Grade A">
                          A: {b.jumlah_grade_a ?? 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800" title="Grade B">
                          B: {b.jumlah_grade_b ?? 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800" title="Grade C">
                          C: {b.jumlah_grade_c ?? 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800" title="Reject">
                          R: {b.jumlah_reject ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/batches/${b.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Scan & Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
