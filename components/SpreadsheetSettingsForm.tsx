"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SpreadsheetSettings } from "@/types/database";

export default function SpreadsheetSettingsForm({
  settings,
}: {
  settings: SpreadsheetSettings | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [spreadsheetId, setSpreadsheetId] = useState(
    settings?.spreadsheet_id ?? ""
  );
  const [sheetName, setSheetName] = useState(settings?.sheet_name ?? "Pengaduan");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      spreadsheet_id: spreadsheetId.trim(),
      sheet_name: sheetName.trim() || "Pengaduan",
    };

    const { error } = settings
      ? await supabase
          .from("spreadsheet_settings")
          .update(payload)
          .eq("id", settings.id)
      : await supabase.from("spreadsheet_settings").insert(payload);

    setLoading(false);
    if (error) {
      setMessage("Gagal menyimpan: " + error.message);
    } else {
      setMessage("Pengaturan spreadsheet berhasil disimpan.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSave} className="card space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Spreadsheet ID
        </label>
        <input
          className="input-field"
          placeholder="contoh: 1A2B3C4D5E6F... (dari URL Google Sheets)"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-400">
          Ambil dari URL: docs.google.com/spreadsheets/d/
          <strong>SPREADSHEET_ID</strong>/edit
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nama Sheet (tab)
        </label>
        <input
          className="input-field"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
      </div>

      {message && (
        <p className="rounded-lg bg-sky-50 px-4 py-2 text-sm text-sky-800">
          {message}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
