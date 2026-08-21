"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Complaint, ComplaintStatus, STATUS_LABEL } from "@/types/database";
import { useToast } from "@/lib/toast-context";

const STATUS_OPTIONS: ComplaintStatus[] = [
  "baru",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
];

export default function UpdateStatusPanel({
  complaint,
}: {
  complaint: Complaint;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const { error: updateError } = await supabase
      .from("complaints")
      .update({ status })
      .eq("id", complaint.id);

    if (!updateError && note.trim()) {
      await supabase.from("status_history").insert({
        complaint_id: complaint.id,
        status,
        note: note.trim(),
      });
    }

    setLoading(false);
    if (updateError) {
      toast("Gagal menyimpan perubahan.", "error");
    } else {
      toast("Perubahan berhasil disimpan.", "success");
      setNote("");
      router.refresh();
    }
  }

  return (
    <div className="card p-6">
      <h3 className="font-medium text-navy-800">Panel Aksi Admin</h3>

      <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">
        Ubah Status Laporan
      </label>
      <select
        className="input-field"
        value={status}
        onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">
        Tanggapan Resmi (Catatan)
      </label>
      <textarea
        className="input-field min-h-[100px]"
        placeholder="Berikan penjelasan detail mengenai perkembangan laporan ini kepada warga..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="mt-1 text-xs text-gray-400">
        Tanggapan ini akan muncul di halaman cek-status milik pelapor.
      </p>

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary mt-4 w-full"
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}
