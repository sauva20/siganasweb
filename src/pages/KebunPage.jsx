import { useEffect, useState } from "react";
import { listKebun, createKebun } from "../api/kebun";
import { listUsers } from "../api/users";

const initialForm = {
  nama_kebun: "",
  kecamatan: "",
  varietas_nanas: "Simadu",
  jenis_bibit: "Lokal",
  jenis_pupuk: "",
  tanggal_tanam: "",
  latitude: "",
  longitude: "",
  luas_lahan_hektar: "",
  petani_id: "",
};

export default function KebunPage() {
  const [kebunList, setKebunList] = useState([]);
  const [petaniList, setPetaniList] = useState([]);
  useEffect(() => {
    listUsers({ role: "petani" }).then(setPetaniList).catch(() => {});
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function loadKebun() {
    setIsLoading(true);
    listKebun()
      .then(setKebunList)
      .catch(() => setError("Gagal memuat daftar kebun."))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadKebun, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createKebun({
        ...form,
        petani_id: parseInt(form.petani_id, 10),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        luas_lahan_hektar: form.luas_lahan_hektar ? parseFloat(form.luas_lahan_hektar) : null,
        tanggal_tanam: form.tanggal_tanam || null,
      });
      setForm(initialForm);
      setShowForm(false);
      loadKebun();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan kebun.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kebun & Petani</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Kelola profil kebun, lokasi geografis (GPS), dan varietas nanas di Kabupaten Subang.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <span>{showForm ? "✕ Batal" : "+ Tambah Kebun Baru"}</span>
        </button>
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
          className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

          <div className="col-span-1 md:col-span-2 pb-2 border-b border-slate-100 mb-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>📍</span> Informasi Kebun Baru
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Petani Pemilik
            </label>
            <select
              required
              value={form.petani_id}
              onChange={(e) => update("petani_id", e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            >
              <option value="">Pilih petani...</option>
              {petaniList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama_lengkap} ({p.username})</option>
              ))}
            </select>
          </div>

          <TextField label="Nama Kebun" value={form.nama_kebun} onChange={(v) => update("nama_kebun", v)} placeholder="Kebun Nanas Simadu Super" required />
          <TextField label="Kecamatan" value={form.kecamatan} onChange={(v) => update("kecamatan", v)} placeholder="Jalancagak" />
          <TextField label="Varietas Nanas" value={form.varietas_nanas} onChange={(v) => update("varietas_nanas", v)} />
          <TextField label="Jenis Bibit" value={form.jenis_bibit} onChange={(v) => update("jenis_bibit", v)} />
          <TextField label="Jenis Pupuk" value={form.jenis_pupuk} onChange={(v) => update("jenis_pupuk", v)} />
          <TextField label="Tanggal Tanam" type="date" value={form.tanggal_tanam} onChange={(v) => update("tanggal_tanam", v)} />
          <TextField label="Latitude (GPS)" value={form.latitude} onChange={(v) => update("latitude", v)} placeholder="-6.5678" required />
          <TextField label="Longitude (GPS)" value={form.longitude} onChange={(v) => update("longitude", v)} placeholder="107.9123" required />
          <TextField label="Luas Lahan (Hektar)" value={form.luas_lahan_hektar} onChange={(v) => update("luas_lahan_hektar", v)} placeholder="2.5" />

          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl px-6 py-3 text-sm transition shadow-md shadow-emerald-800/20"
            >
              Simpan Data Kebun
            </button>
          </div>
        </form>
      )}

      {/* Table Data Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat daftar kebun...</div>
        ) : kebunList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada kebun terdaftar. Silakan tambah data kebun baru.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Kebun</th>
                  <th className="px-6 py-4 font-semibold">Kecamatan</th>
                  <th className="px-6 py-4 font-semibold">Varietas</th>
                  <th className="px-6 py-4 font-semibold">Luas Lahan</th>
                  <th className="px-6 py-4 font-semibold">Koordinat GPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {kebunList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        🏡
                      </span>
                      {k.nama_kebun}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        📍 {k.kecamatan || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        🍍 {k.varietas_nanas}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {k.luas_lahan_hektar ? `${k.luas_lahan_hektar} ha` : "-"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {k.latitude && k.longitude ? `${k.latitude}, ${k.longitude}` : "-"}
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

function TextField({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800
                   placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500
                   focus:outline-none transition"
      />
    </div>
  );
}
