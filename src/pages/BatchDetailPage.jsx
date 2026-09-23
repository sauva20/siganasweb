import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBatch, verifyBatchIntegrity, getBatchQrCodeObjectUrl } from "../api/batches";
import { getGradingResults, scanPineapple, saveManualGrading } from "../api/grading";

const GRADE_COLORS = {
  "Grade A": "bg-emerald-100 text-emerald-800 border border-emerald-300",
  "Grade B": "bg-amber-100 text-amber-800 border border-amber-300",
  "Grade C": "bg-blue-100 text-blue-800 border border-blue-300",
  Reject: "bg-rose-100 text-rose-800 border border-rose-300",
};

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const { user } = useAuth();
  const canScan = user?.role === "petani" || user?.role === "dinas_pertanian" || !user?.role;

  const [batch, setBatch] = useState(null);
  const [results, setResults] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState("");

  // Form scan
  const [foto, setFoto] = useState(null);
  const [brix, setBrix] = useState("");
  const [berat, setBerat] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [gradingMode, setGradingMode] = useState("AI");
  const [manualData, setManualData] = useState({
    grade: "A",
    sizeScore: "sedang",
    colorScore: "kuning",
    kematangan: 80,
    shapeScore: "sempurna",
    defectScore: "Tidak Ada Cacat",
    confidence: 1.0,
    weight: 1.0
  });

  function loadAll() {
    getBatch(batchId).then(setBatch).catch(() => setError("Gagal memuat data batch."));
    getGradingResults(batchId).then((res) => setResults(res || [])).catch(() => {});
  }

  useEffect(() => {
    loadAll();
  }, [batchId]);

  async function handleLoadQr() {
    try {
      const url = await getBatchQrCodeObjectUrl(batchId);
      setQrUrl(url);
    } catch {
      setError("Gagal memuat QR Code.");
    }
  }

  async function handleVerify() {
    try {
      const result = await verifyBatchIntegrity(batchId);
      setVerification(result);
    } catch {
      setError("Gagal memverifikasi integritas data.");
    }
  }

  async function handleScan(e) {
    e.preventDefault();
    if (!foto) return;
    setIsScanning(true);
    setScanResult(null);
    setError("");
    try {
      const result = await scanPineapple(batchId, {
        foto,
        inputBrixManual: brix,
        inputBeratManualKg: berat,
      });
      setScanResult(result);
      setFoto(null);
      setBrix("");
      setBerat("");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal memproses grading.");
    } finally {
      setIsScanning(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setIsScanning(true);
    setScanResult(null);
    setError("");
    try {
      const result = await saveManualGrading(batchId, manualData);
      setScanResult(result);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan grading manual.");
    } finally {
      setIsScanning(false);
    }
  }

  if (!batch) {
    return (
      <div className="p-12 text-center text-slate-400">
        Memuat detail batch panen...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/batches" className="text-xs font-bold text-emerald-700 hover:underline mb-2 inline-block">
            ← Kembali ke Daftar Batch
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 border border-emerald-600/50 flex items-center justify-center font-bold text-xl shadow-xs">
              🍍
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Batch: {batch.kode_batch}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Tanggal Panen: <span className="font-semibold text-slate-700">{batch.tanggal_panen}</span> · Status: <span className="font-semibold text-emerald-700">{batch.status_distribusi}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-end">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Total {batch.total_buah ?? 0} Buah
          </span>
          <button
            onClick={() => {
              // Mock seal action for now, this would usually call an API
              alert('Fungsi Seal (Kunci Batch) sedang dalam perbaikan / akan memanggil endpoint /seal');
            }}
            className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg px-4 py-2 shadow-sm transition"
          >
            🔒 Akhiri & Kunci Batch
          </button>
        </div>
      </div>

      {/* Grade Progress Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-600 rounded-full"></span> Distribusi Mutu Panen
        </h3>
        <div className="space-y-4">
          <ProgressBar label="Grade A (Ekspor)" value={batch.jumlah_grade_a} total={batch.total_buah} color="bg-emerald-500" />
          <ProgressBar label="Grade B (Premium Lokal)" value={batch.jumlah_grade_b} total={batch.total_buah} color="bg-amber-500" />
          <ProgressBar label="Grade C (Standar)" value={batch.jumlah_grade_c} total={batch.total_buah} color="bg-blue-500" />
          <ProgressBar label="Reject" value={batch.jumlah_reject} total={batch.total_buah} color="bg-rose-500" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Scan & Grading History */}
        <div className="lg:col-span-2 space-y-6">
          {canScan && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-amber-500"></div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>📸</span> Input Data Grading
                </h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setGradingMode("AI")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${gradingMode === "AI" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    AI YOLOv11
                  </button>
                  <button
                    onClick={() => setGradingMode("Manual")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${gradingMode === "Manual" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Manual Input
                  </button>
                </div>
              </div>

              {gradingMode === "AI" ? (
                <form onSubmit={handleScan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Unggah Foto Nanas
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setFoto(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4
                                 file:rounded-xl file:border-0 file:bg-emerald-700 file:text-white
                                 file:font-bold hover:file:bg-emerald-800 transition cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Brix Manual (Brix °)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Contoh: 14.5"
                        value={brix}
                        onChange={(e) => setBrix(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Berat Buah (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Contoh: 1.85"
                        value={berat}
                        onChange={(e) => setBerat(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isScanning || !foto}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm transition shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menjalankan Deteksi AI YOLOv11...</span>
                      </>
                    ) : (
                      <span>Proses Scan AI & Klasifikasi Grade</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Grade Mutu
                      </label>
                      <select
                        value={manualData.grade}
                        onChange={(e) => setManualData({...manualData, grade: e.target.value})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="A">Grade A (Ekspor)</option>
                        <option value="B">Grade B (Premium Lokal)</option>
                        <option value="C">Grade C (Standar)</option>
                        <option value="Reject">Reject</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Ukuran
                      </label>
                      <select
                        value={manualData.sizeScore}
                        onChange={(e) => setManualData({...manualData, sizeScore: e.target.value})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="kecil">Kecil (&lt; 0.8 kg)</option>
                        <option value="sedang">Sedang (0.8 - 1.2 kg)</option>
                        <option value="besar">Besar (&gt; 1.2 kg)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Warna Kulit
                      </label>
                      <select
                        value={manualData.colorScore}
                        onChange={(e) => setManualData({...manualData, colorScore: e.target.value})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="hijau">Hijau (Mentah)</option>
                        <option value="kuning_kehijauan">Kuning Hijau (Mengkal)</option>
                        <option value="kuning">Kuning (Matang)</option>
                        <option value="oranye">Oranye (Terlalu Matang)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kematangan (%)
                      </label>
                      <input
                        type="number"
                        min="0" max="100"
                        value={manualData.kematangan}
                        onChange={(e) => setManualData({...manualData, kematangan: Number(e.target.value)})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kondisi Mahkota
                      </label>
                      <select
                        value={manualData.shapeScore}
                        onChange={(e) => setManualData({...manualData, shapeScore: e.target.value})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="sempurna">Sempurna</option>
                        <option value="cacat_rusak">Cacat / Tidak Sempurna</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kondisi Defect
                      </label>
                      <select
                        value={manualData.defectScore}
                        onChange={(e) => setManualData({...manualData, defectScore: e.target.value})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Tidak Ada Cacat">Tidak Ada Cacat</option>
                        <option value="Luka Mekanis">Luka Mekanis</option>
                        <option value="Busuk">Busuk</option>
                        <option value="Hama/Penyakit">Hama/Penyakit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Berat (Kg)
                      </label>
                      <input
                        type="number" step="0.01"
                        value={manualData.weight}
                        onChange={(e) => setManualData({...manualData, weight: Number(e.target.value)})}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm transition shadow-md flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Grading Manual</span>
                    )}
                  </button>
                </form>
              )}

              {scanResult && (
                <div className="mt-5 rounded-xl border border-emerald-200 p-4 bg-emerald-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`${GRADE_COLORS[scanResult.grade_mutu]} font-bold rounded-full px-3 py-1 text-xs`}>
                        {scanResult.grade_mutu}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Confidence: {(Number(scanResult.confidence_score) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-2">{scanResult.rekomendasi_pasar}</p>
                    <p className="text-xs text-emerald-800 font-bold mt-0.5">
                      Estimasi Harga: Rp {Number(scanResult.estimasi_harga_min).toLocaleString("id-ID")} – Rp{" "}
                      {Number(scanResult.estimasi_harga_max).toLocaleString("id-ID")} / kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📋</span> Riwayat Scan Grading ({results.length})
              </h3>
            </div>

            {results.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">Belum ada hasil grading untuk batch ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Grade Mutu</th>
                      <th className="px-6 py-4 font-semibold">Key Akin / Conf</th>
                      <th className="px-6 py-4 font-semibold">Rekomendasi Pasar</th>
                      <th className="px-6 py-4 font-semibold">Waktu Scan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <span className={`${GRADE_COLORS[r.grade_mutu] || "bg-slate-100 text-slate-800"} font-bold rounded-md px-2.5 py-1 text-xs`}>
                            {r.grade_mutu}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {(Number(r.confidence_score) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{r.rekomendasi_pasar}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {new Date(r.scanned_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QR & Blockchain Integrity */}
        <div className="space-y-6">
          {/* QR Code Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center justify-center gap-2">
              <span>📱</span> QR Traceability Publik
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scan untuk melihat bukti keaslian blockchain & profil kebun publik.
            </p>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://siganas.com/public/trace/${batch.kode_batch}`)}`} 
              alt="QR Code Batch" 
              className="mx-auto rounded-xl border border-slate-200 shadow-sm w-48 h-48" 
            />
            <a
              href={`https://siganas.com/public/trace/${batch.kode_batch}`}
              target="_blank" rel="noreferrer"
              className="mt-4 block w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl py-2.5 text-xs transition text-center"
            >
              Buka Halaman Traceability
            </a>
          </div>

          {/* Blockchain Verification */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <span>⛓️</span> Verifikasi Blockchain (SHA-256)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Verifikasi keaslian catatan batch pada ledger SHA-256.
            </p>
            <button
              onClick={handleVerify}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-2.5 text-xs transition shadow-sm"
            >
              Cek Integritas Ledger Data
            </button>
            {verification && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-xs font-semibold ${
                  verification.is_valid
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {verification.is_valid ? "✅ Integritas Terverifikasi Valid" : "❌ Peringatan Integritas"}
                <p className="text-[11px] font-normal mt-1 text-slate-600">{verification.detail}</p>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <span>📊</span> Statistik Batch
            </h3>
            <dl className="text-xs space-y-2.5 divide-y divide-slate-100">
              <Row label="Total Buah" value={`${batch.total_buah ?? 0} buah`} />
              <Row label="Total Berat" value={`${batch.total_berat_kg ?? 0} kg`} />
              <Row label="Grade A (Ekspor)" value={batch.jumlah_grade_a ?? 0} />
              <Row label="Grade B (Premium)" value={batch.jumlah_grade_b ?? 0} />
              <Row label="Grade C (Standar)" value={batch.jumlah_grade_c ?? 0} />
              <Row label="Reject" value={batch.jumlah_reject ?? 0} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between pt-2">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round(((value || 0) / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{value || 0} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
