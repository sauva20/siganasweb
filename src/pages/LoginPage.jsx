import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ingatSaya, setIngatSaya] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Gagal masuk. Periksa kembali username dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-800/90 border border-emerald-500/40 shadow-xl shadow-emerald-950/60 text-3xl mb-4">
            🍍
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SIGANAS
          </h1>
          <p className="text-emerald-200/80 text-sm mt-1">
            Sistem Informasi Grading Nanas Subang
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/50 p-8 border border-white/20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun</h2>
            <p className="text-slate-500 text-xs mt-1">
              Masukkan username dan kata sandi Anda untuk mengakses sistem.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna (Username)
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm
                           text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white
                           transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm
                           text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white
                           transition"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={ingatSaya}
                  onChange={(e) => setIngatSaya(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                Ingat saya
              </label>
              <button
                type="button"
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 disabled:opacity-60
                         text-white font-bold rounded-xl py-3.5 transition shadow-lg shadow-emerald-900/30 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard →</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-emerald-200/60 mt-8">
          © {new Date().getFullYear()} SIGANAS • Politeknik Negeri Subang
        </p>
      </div>
    </div>
  );
}
