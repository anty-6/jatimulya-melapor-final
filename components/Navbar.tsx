import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/lapor", label: "Lapor" },
  { href: "/panduan", label: "Panduan" },
  { href: "/status", label: "Cek Status" },
];

export default function Navbar() {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-medium text-navy-800">
          Jatimulya Melapor
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-navy-700"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="hover:text-navy-700">
            Admin
          </Link>
        </nav>
        <Link href="/lapor" className="btn-primary text-sm">
          Lapor Sekarang
        </Link>
      </div>
    </header>
  );
}
