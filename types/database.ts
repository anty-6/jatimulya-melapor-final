export type ComplaintStatus =
  | "baru"
  | "diverifikasi"
  | "diproses"
  | "selesai"
  | "ditolak";

export interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  category: string;
  description: string;
  location: string;
  photo_urls: string[];
  is_anonymous: boolean;
  reporter_name: string | null;
  reporter_phone: string | null;
  reporter_nik: string | null;
  is_reporter_verified: boolean;
  status: ComplaintStatus;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryItem {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SpreadsheetSettings {
  id: string;
  spreadsheet_id: string;
  sheet_name: string;
  last_synced_at: string | null;
  updated_at: string;
}

export const STATUS_LABEL: Record<ComplaintStatus, string> = {
  baru: "Baru",
  diverifikasi: "Terverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export const STATUS_BADGE_CLASS: Record<ComplaintStatus, string> = {
  baru: "bg-amber-100 text-amber-800",
  diverifikasi: "bg-blue-100 text-blue-800",
  diproses: "bg-sky-100 text-sky-800",
  selesai: "bg-green-100 text-green-800",
  ditolak: "bg-red-100 text-red-800",
};
