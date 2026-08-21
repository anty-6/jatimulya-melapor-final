import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { IconReport, IconRefresh, IconCheckCircle } from "@/components/icons";

async function getStats() {
  const supabase = createClient();
  const [{ count: total }, { count: proses }, { count: selesai }] =
    await Promise.all([
      supabase.from("complaints").select("*", { count: "exact", head: true }),
      supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "diproses"),
      supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "selesai"),
    ]);

  return {
    total: total ?? 0,
    proses: proses ?? 0,
    selesai: selesai ?? 0,
  };
}

const testimonials = [
  {
    quote:
      "Alhamdulillah, laporan lampu jalan yang mati di RT 04 langsung ditanggapi keesokan harinya.",
    name: "Bapak Agus Santoso",
    role: "Warga Dusun 1",
    initials: "BP",
  },
  {
    quote:
      "Sistemnya sangat transparan. Kita bisa pantau progres laporan tanpa harus bolak-balik ke kantor desa.",
    name: "Ibu Siti Darwati",
    role: "Warga Dusun 2",
    initials: "SD",
  },
  {
    quote:
      "Respon admin sangat ramah. Saya melaporkan masalah saluran air dan langsung dikerahkan tim kebersihan.",
    name: "Andi Nugraha",
    role: "Pelaku UMKM Desa",
    initials: "AN",
  },
];

const steps = [
  {
    n: 1,
    title: "Tulis Laporan",
    desc: "Laporkan keluhan atau aspirasi Anda dengan jelas beserta lokasi kejadian.",
  },
  {
    n: 2,
    title: "Verifikasi Laporan",
    desc: "Tim admin desa memverifikasi dan meneruskan laporan Anda.",
  },
  {
    n: 3,
    title: "Tindak Lanjut",
    desc: "Instansi terkait akan menindaklanjuti dan menyelesaikan permasalahan tersebut.",
  },
  {
    n: 4,
    title: "Selesai",
    desc: "Anda akan mendapatkan notifikasi saat laporan telah dinyatakan selesai.",
  },
];

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div>
      <Navbar />

      <section className="relative isolate min-h-[420px] overflow-hidden bg-navy-900 text-white sm:min-h-[480px]">
        {/* Simpan foto hero di public/images/hero-jatimulya.jpg agar tampil di sini.
            Selama file belum ada, background gradient navy di bawah ini jadi fallback-nya. */}
        <Image
          src="/images/hero-jatimulya.jpg"
          alt="Pemandangan Desa Jatimulya"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />

        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-24">
          <h1 className="max-w-xl text-4xl font-medium leading-tight">
            Suara Anda Adalah Amanah Kami Untuk Jatimulya
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Sampaikan keluhan, aspirasi, atau laporan terkait infrastruktur dan
            layanan publik desa secara transparan dan cepat.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/lapor" className="btn-primary bg-sky-600 hover:bg-sky-700">
              Lapor Sekarang
            </Link>
            <Link
              href="/panduan"
              className="rounded-lg border border-white/30 px-5 py-2.5 font-medium hover:bg-white/10"
            >
              Panduan Melapor
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-4xl px-6">
        <div className="card grid grid-cols-3 divide-x divide-black/5 px-6 py-8 text-center shadow-lg shadow-navy-900/10">
          <div className="flex flex-col items-center">
            <IconReport className="h-6 w-6 text-navy-800" strokeWidth={1.75} />
            <p className="mt-2 text-2xl font-medium text-navy-800">
              {stats.total}
            </p>
            <p className="mt-1 text-xs uppercase text-gray-500">
              Total Laporan
            </p>
          </div>
          <div className="flex flex-col items-center">
            <IconRefresh className="h-6 w-6 text-navy-800" strokeWidth={1.75} />
            <p className="mt-2 text-2xl font-medium text-navy-800">
              {stats.proses}
            </p>
            <p className="mt-1 text-xs uppercase text-gray-500">
              Laporan Diproses
            </p>
          </div>
          <div className="flex flex-col items-center">
            <IconCheckCircle className="h-6 w-6 text-emerald-600" strokeWidth={1.75} />
            <p className="mt-2 text-2xl font-medium text-navy-800">
              {stats.selesai}
            </p>
            <p className="mt-1 text-xs uppercase text-gray-500">
              Laporan Selesai
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-2xl font-medium text-navy-800">
          Bagaimana Cara Melapor?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Proses pelaporan dirancang agar mudah dan transparan bagi seluruh
          warga Desa Jatimulya.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card p-5 text-left">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-sm text-white">
                {s.n}
              </span>
              <p className="mt-4 font-medium text-navy-800">{s.title}</p>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-medium text-navy-800">
            Kata Warga Jatimulya
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Kepercayaan warga adalah prioritas utama kami dalam memberikan
            pelayanan terbaik.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="text-sky-500">{"★".repeat(5)}</div>
                <p className="mt-3 text-sm italic text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-medium text-sky-800">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-navy-800">
          <Image
            src="/images/hero-jatimulya.jpg"
            alt="Pemandangan Desa Jatimulya"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/95 via-navy-800/90 to-navy-800" />

          <div className="relative mx-auto max-w-2xl px-6 py-20 text-center text-white">
            <h2 className="text-3xl font-medium leading-snug">
              Siap Untuk Berkontribusi?
              <br />
              Lapor Sekarang Juga.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/80">
              Mari bersama-sama membangun Desa Jatimulya yang lebih baik,
              transparan, dan responsif terhadap kebutuhan masyarakat.
            </p>
            <Link
              href="/lapor"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-medium text-navy-800 hover:bg-gray-100"
            >
              Mulai Laporan Baru
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}