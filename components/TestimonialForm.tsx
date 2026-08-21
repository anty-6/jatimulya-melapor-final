"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";

export default function TestimonialForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast("Pilih rating bintang terlebih dahulu.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, rating, message }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast("Terima kasih atas ulasan Anda!", "success");
      setName(""); setRole(""); setRating(0); setMessage("");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message ?? "Terjadi kesalahan.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-outline text-sm"
        >
          + Tulis Ulasan Anda
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="card mt-4 p-5 space-y-4 max-w-lg"
        >
          <h3 className="font-medium text-navy-800">Tulis Ulasan</h3>

          {/* Rating bintang */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-2xl leading-none transition-transform hover:scale-110"
                >
                  <span
                    className={
                      star <= (hovered || rating)
                        ? "text-sky-500"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center text-xs text-gray-500">
                  {["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][rating]}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama
              </label>
              <input
                className="input-field"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Keterangan
              </label>
              <input
                className="input-field"
                placeholder="Warga Dusun 1 / UMKM Desa"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ulasan
            </label>
            <textarea
              className="input-field min-h-[90px]"
              placeholder="Ceritakan pengalaman Anda menggunakan layanan ini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm"
            >
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-outline text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
