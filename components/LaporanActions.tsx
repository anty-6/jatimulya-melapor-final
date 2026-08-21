"use client";

import { useState } from "react";
import { IconDownload, IconPrinter, IconSheet } from "@/components/icons";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonthStr() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function LaporanActions({
  hasSpreadsheetConfigured,
}: {
  hasSpreadsheetConfigured: boolean;
}) {
  const [start, setStart]               = useState(firstOfMonthStr());
  const [end, setEnd]                   = useState(todayStr());
  const [kepalaDesa, setKepalaDesa]     = useState("");
  const [nipKepala, setNipKepala]       = useState("");
  const [showPreview, setShowPreview]   = useState(false);
  const [syncing, setSyncing]           = useState(false);
  const [syncMessage, setSyncMessage]   = useState<string | null>(null);

  function buildApiUrl() {
    const params = new URLSearchParams({ start, end });
    if (kepalaDesa) params.set("kepalaDesa", kepalaDesa);
    if (nipKepala)  params.set("nipKepala", nipKepala);
    return `/api/laporan/pdf?${params.toString()}`;
  }

  function handlePreview() {
    setShowPreview(true);
  }

  function handleClose() {
    setShowPreview(false);
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = buildApiUrl();
    a.download = `rekapitulasi-pengaduan-${start}-${end}.pdf`;
    a.click();
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res  = await fetch("/api/laporan/sync-sheets", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSyncMessage(`Berhasil! ${data.totalRows} baris dikirim ke Google Sheets.`);
    } catch (err: any) {
      setSyncMessage(err.message ?? "Gagal sinkronisasi.");
    } finally {
      setSyncing(false);
    }
  }

  const xlsxQuery = new URLSearchParams({ start, end }).toString();

  return (
    <>
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="font-medium text-navy-800">Periode Laporan</h3>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Dari Tanggal</label>
              <input type="date" className="input-field" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Sampai Tanggal</label>
              <input type="date" className="input-field" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Tanda Tangan PDF (opsional)</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Nama Kepala Desa</label>
                <input type="text" className="input-field" placeholder="Contoh: H. Fulan Bin Fulan" value={kepalaDesa} onChange={(e) => setKepalaDesa(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">NIP</label>
                <input type="text" className="input-field" placeholder="Contoh: 19750812 200501 1 003" value={nipKepala} onChange={(e) => setNipKepala(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handlePreview} className="btn-primary flex items-center gap-2 text-sm">
              <IconPrinter className="h-4 w-4" />
              Preview PDF
            </button>
            <a href={`/api/laporan/spreadsheet?${xlsxQuery}`} className="btn-outline flex items-center gap-2 text-sm">
              <IconDownload className="h-4 w-4" />
              Download Excel (.xlsx)
            </a>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-medium text-navy-800">
            <IconSheet className="h-4 w-4" />
            Sambungkan ke Google Spreadsheet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Dorong seluruh data pengaduan secara langsung ke Google Sheets yang sudah dihubungkan,
            sehingga datanya selalu sinkron tanpa perlu download manual.
          </p>
          {!hasSpreadsheetConfigured ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Spreadsheet belum dihubungkan. Atur Spreadsheet ID di halaman{" "}
              <a href="/admin/pengaturan" className="underline">Pengaturan</a> terlebih dahulu.
            </p>
          ) : (
            <button onClick={handleSync} disabled={syncing} className="btn-primary mt-4 text-sm">
              {syncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
            </button>
          )}
          {syncMessage && (
            <p className="mt-3 rounded-lg bg-sky-50 px-4 py-2 text-sm text-sky-800">{syncMessage}</p>
          )}
        </div>
      </div>

      {/* ── MODAL PREVIEW ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-medium text-gray-800">Preview Rekapitulasi Pengaduan</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="btn-primary flex items-center gap-2 text-sm">
                  <IconDownload className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleClose}
                  className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={buildApiUrl()}
                className="h-full w-full border-0"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}