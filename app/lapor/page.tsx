import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComplaintForm from "@/components/ComplaintForm";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Infrastruktur Jalan" },
  { id: "2", name: "Kebersihan & Limbah" },
  { id: "3", name: "Layanan Administrasi" },
  { id: "4", name: "Lampu Penerangan" },
  { id: "5", name: "Keamanan" },
  { id: "6", name: "Bantuan Sosial" },
  { id: "7", name: "Lainnya" },
];

export default async function LaporPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  // fallback kalau DB kosong / belum di-seed
  const resolvedCategories =
    categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <div className="card h-fit p-6">
            <h2 className="text-lg font-medium text-navy-800">
              Panduan Pelaporan
            </h2>
            <ul className="mt-4 space-y-4 text-sm text-gray-600">
              <li>
                <p className="font-medium text-gray-800">Detail yang Jelas</p>
                <p>
                  Sampaikan laporan Anda dengan bahasa yang santun, jelas, dan
                  didukung bukti foto yang akurat.
                </p>
              </li>
              <li>
                <p className="font-medium text-gray-800">Lokasi Spesifik</p>
                <p>
                  Sebutkan alamat atau patokan lokasi yang memudahkan petugas
                  melakukan pengecekan.
                </p>
              </li>
              <li>
                <p className="font-medium text-gray-800">Privasi Terjamin</p>
                <p>
                  Data pribadi Anda akan kami jaga kerahasiaannya sesuai
                  standar operasional prosedur yang berlaku.
                </p>
              </li>
            </ul>
            <div className="mt-5 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
              Estimasi Waktu Respon
              <p className="font-medium">1 - 3 Hari Kerja</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-medium text-navy-800">
              Form Pengaduan
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Sampaikan keluhan atau aspirasi Anda demi Jatimulya yang lebih
              baik.
            </p>
            <div className="mt-6">
              <ComplaintForm categories={resolvedCategories} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}