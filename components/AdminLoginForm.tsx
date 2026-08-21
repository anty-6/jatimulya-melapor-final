"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Username atau password salah.");
      setLoading(false);
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom");
    // Gunakan full navigation agar cookie auth langsung terbaca server-side
    window.location.href = redirectedFrom || "/admin/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="mt-4 text-center text-xl font-medium text-navy-800">
            Akses Administrator
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Silakan masuk untuk mengelola pengaduan warga.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@jatimulya.desa.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kata Sandi
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
