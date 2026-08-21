import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  {
    n: 1,
    title: "Tulis Laporan",
    desc: "Buka menu Lapor, isi judul, kategori, dan ceritakan kejadiannya dengan jelas beserta lokasi.",
  },
  {
    n: 2,
    title: "Verifikasi Laporan",
    desc: "Tim admin desa akan memverifikasi laporan Anda dalam waktu 1-3 hari kerja.",
  },
  {
    n: 3,
    title: "Tindak Lanjut",
    desc: "Laporan yang terverifikasi akan diteruskan ke instansi/tim teknis terkait untuk ditindaklanjuti.",
  },
  {
    n: 4,
    title: "Selesai & Notifikasi",
    desc: "Anda bisa memantau perkembangannya kapan saja lewat menu Cek Status menggunakan nomor pengaduan.",
  },
];

const faqs = [
  {
    q: "Apakah saya harus mendaftar akun untuk melapor?",
    a: "Tidak. Anda bisa langsung mengisi form pengaduan tanpa perlu membuat akun.",
  },
  {
    q: "Apakah saya bisa melapor tanpa mencantumkan nama?",
    a: "Bisa. Aktifkan toggle \"Lapor Secara Anonim\" pada form pengaduan, identitas Anda tidak akan ditampilkan ke publik maupun admin.",
  },
  {
    q: "Bagaimana cara mengecek status laporan saya?",
    a: "Simpan nomor pengaduan yang muncul setelah laporan terkirim, lalu masukkan di halaman Cek Status.",
  },
];

export default function PanduanPage() {
  return (
    <div>
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-2xl font-medium text-navy-800">
          Panduan Melapor
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Ikuti langkah-langkah berikut untuk menyampaikan keluhan atau
          aspirasi Anda kepada Pemerintah Desa Jatimulya.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.n} className="card p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-sm text-white">
                {s.n}
              </span>
              <p className="mt-4 font-medium text-navy-800">{s.title}</p>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/lapor" className="btn-primary">
            Mulai Laporan Sekarang
          </Link>
        </div>

        <div id="faq" className="mt-14">
          <h2 className="text-lg font-medium text-navy-800">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="mt-4 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card p-5">
                <p className="font-medium text-gray-800">{f.q}</p>
                <p className="mt-1 text-sm text-gray-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="privasi" className="mt-14">
          <h2 className="text-lg font-medium text-navy-800">
            Kebijakan Privasi
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Data pribadi pelapor (nama, NIK, nomor WhatsApp) hanya dapat
            diakses oleh admin desa untuk keperluan verifikasi dan tindak
            lanjut, serta tidak ditampilkan ke publik. Pelapor yang memilih
            opsi anonim tidak akan menyimpan data identitas sama sekali.
          </p>
        </div>

        <div id="kontak" className="mt-14">
          <h2 className="text-lg font-medium text-navy-800">Kontak Kami</h2>
          <p className="mt-3 text-sm text-gray-600">
            Kantor Desa Jatimulya, Jl. Jatimulya Raya No. 1, Bekasi, Jawa
            Barat 17510
            <br />
            Telp: (021) 8800123 · Surel: desa@jatimulya.desa.id
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
