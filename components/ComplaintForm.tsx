"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/database";
import { IconCamera } from "@/components/icons";

export default function ComplaintForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterNik, setReporterNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...newFiles]);
    // reset input biar bisa pilih file yang sama lagi
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !category || !description || !location) {
      setError("Mohon lengkapi semua kolom wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Upload foto ke storage (masih pakai client, bucket policy sudah allow anon)
      const photoUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("bukti-pengaduan")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("bukti-pengaduan")
          .getPublicUrl(path);
        photoUrls.push(data.publicUrl);
      }

      // Submit complaint lewat API route (server-side, pakai service role key)
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          location,
          photo_urls: photoUrls,
          is_anonymous: isAnonymous,
          reporter_name: isAnonymous ? null : reporterName,
          reporter_phone: isAnonymous ? null : reporterPhone,
          reporter_nik: isAnonymous ? null : reporterNik,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Terjadi kesalahan.");

      router.push(`/status?nomor=${result.complaint_number}&baru=1`);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Judul Laporan
        </label>
        <input
          className="input-field"
          placeholder="Contoh: Jalan Rusak di RT 03"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select
          className="input-field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Pilih Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Isi Laporan
        </label>
        <textarea
          className="input-field min-h-[120px]"
          placeholder="Tuliskan detail laporan Anda di sini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Lokasi
        </label>
        <input
          className="input-field"
          placeholder="Nama jalan, RT/RW, atau patokan terdekat"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Upload Foto (Opsional)
        </label>

        {previews.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 hover:bg-gray-100"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <IconCamera className="mb-2 h-6 w-6 text-gray-400" />
          {files.length > 0 ? "Tambah foto lagi" : "Klik atau tarik foto ke sini untuk mengunggah"}
          <span className="mt-1 text-xs text-gray-400">
            Format: JPG, PNG, WEBP, HEIC (maks. 5MB per foto)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="mt-1"
        />
        <div>
          <p className="text-sm font-medium text-gray-800">Lapor Secara Anonim</p>
          <p className="text-xs text-gray-500">
            Nama Anda tidak akan ditampilkan pada publik maupun admin.
          </p>
        </div>
      </div>

      {!isAnonymous && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              className="input-field"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              No. WhatsApp
            </label>
            <input
              className="input-field"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              NIK
            </label>
            <input
              className="input-field"
              value={reporterNik}
              onChange={(e) => setReporterNik(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Mengirim..." : "Kirim Laporan"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Dengan mengirimkan laporan, Anda menyetujui Syarat dan Ketentuan kami.
      </p>
    </form>
  );
}