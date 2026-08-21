import Link from "next/link";

const navigasi = [
  { href: "/", label: "Beranda" },
  { href: "/lapor", label: "Lapor" },
  { href: "/panduan", label: "Panduan" },
  { href: "/status", label: "Cek Status" },
];

const bantuan = [
  { href: "/panduan#kontak", label: "Kontak Kami" },
  { href: "/panduan#privasi", label: "Kebijakan Privasi" },
  { href: "/panduan#faq", label: "FAQ" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-sm">
            <p className="font-medium text-navy-800">Jatimulya Melapor</p>
            <p className="mt-2 text-sm text-gray-600">
              Layanan pengaduan online resmi Pemerintah Desa Jatimulya untuk
              transparansi dan kemajuan bersama.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-sm font-medium text-navy-800">Navigasi</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {navigasi.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-navy-700">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-navy-800">Bantuan</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {bantuan.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-navy-700">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-black/5 pt-6 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Pemerintah Desa Jatimulya.
          Transparansi &amp; Melayani.
        </p>
      </div>
    </footer>
  );
}
