"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { IconSearch, IconBell } from "@/components/icons";

export default function AdminTopbar({
  title,
  adminName,
  notificationCount = 0,
}: {
  title: string;
  adminName: string;
  notificationCount?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/admin/pengaduan?q=${encodeURIComponent(q)}` : "/admin/pengaduan");
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-medium text-navy-800">{title}</h1>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari laporan..."
            className="w-56 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
          />
        </form>

        <Link
          href="/admin/pengaduan?status=baru"
          aria-label="Laporan baru belum ditinjau"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <IconBell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-medium text-navy-800">
            {adminName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <span className="hidden text-sm font-medium text-gray-700 sm:inline">
            {adminName}
          </span>
        </div>
      </div>
    </div>
  );
}