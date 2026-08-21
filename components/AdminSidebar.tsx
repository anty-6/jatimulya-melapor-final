"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import {
  IconDashboard,
  IconList,
  IconReport,
  IconSettings,
  IconLogout,
} from "@/components/icons";

const menu = [
  { href: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/admin/pengaduan", label: "Daftar Laporan", icon: IconList },
  { href: "/admin/laporan", label: "Statistik", icon: IconReport },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: IconSettings },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const initials = adminName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-full w-64 flex-col justify-between overflow-y-auto border-r border-black/5 bg-white text-gray-700">
      <div>
        <div className="px-6 py-6">
          <p className="text-lg font-medium text-navy-800">Jatimulya Melapor</p>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {menu.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-navy-800 font-medium text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-100 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-medium text-sky-800">
            {initials || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {adminName}
            </p>
            <p className="truncate text-xs text-gray-400">jatimulya.go.id</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
        >
          <IconLogout className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}